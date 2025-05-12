const pool = require("../config/db");
const form_helper = require('../middleware/form_helper');
const createForm = async (req, res) => {
  try {
    const { role } = req.user;
    const supervisor_id = req.user.userId;
    const {
      resident_id,
      diagnosis,
      case_complexity,
      investigation_referral,
      treatment,
      future_planning,
      history_taking,
      overall_clinical_care,
      assessor_comment,
      agreed_action_plan,
      draft_send,
    } = req.body;

    const a_signature = req.files?.signature
      ? req.files.signature[0].path
      : null;
    const assessor_signature = form_helper.getPublicUrl(a_signature);

    const values = {
      resident_id: resident_id ?? null,
      supervisor_id: supervisor_id ?? null,
      diagnosis: diagnosis ?? null,
      case_complexity: case_complexity ?? null,
      investigation_referral: investigation_referral ?? null,
      treatment: treatment ?? null,
      future_planning: future_planning ?? null,
      history_taking: history_taking ?? null,
      overall_clinical_care: overall_clinical_care ?? null,
      assessor_comment: assessor_comment ?? null,
      agreed_action_plan: agreed_action_plan ?? null,
      assessor_signature: assessor_signature ?? null,
    };

    const [insertResult] = await pool.execute(
      `INSERT INTO case_based_discussion_assessment 
            (resident_id, supervisor_id, diagnosis, case_complexity, investigation_referral, 
            treatment, future_planning, history_taking, overall_clinical_care, assessor_comment, agreed_action_plan, assessor_signature, sent) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        values.resident_id,
        values.supervisor_id,
        values.diagnosis,
        values.case_complexity,
        values.investigation_referral,
        values.treatment,
        values.future_planning,
        values.history_taking,
        values.overall_clinical_care,
        values.assessor_comment,
        values.agreed_action_plan,
        values.assessor_signature,
        draft_send,
      ]
    );

    const formId = insertResult.insertId;
    if (Number(draft_send) === 1) {
      await form_helper.sendFormToTrainee(
        values.supervisor_id,
        "case_based_discussion_assessment",
        formId
      );
    }

    res.status(201).json({ message: "Form created successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    form_helper.cleanupUploadedFiles(req.files);
    res.status(500).json({ error: "Server error while creating form" });
  }
};

const updateForm = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const {
      diagnosis,
      case_complexity,
      investigation_referral,
      treatment,
      future_planning,
      history_taking,
      overall_clinical_care,
      assessor_comment,
      agreed_action_plan,
      resident_comment,
      draft_send,
    } = req.body;

    const [existingRecord] = await pool.execute(
      `SELECT * FROM case_based_discussion_assessment WHERE id = ?`,
      [id]
    );

    if (existingRecord.length === 0) {
      form_helper.cleanupUploadedFiles(req.files);
      return res.status(404).json({ error: "Record not found" });
    }
    if (Number(existingRecord[0].completed) === 1) {
      form_helper.cleanupUploadedFiles(req.files);
      return res
        .status(403)
        .json({ error: "You cannot edit a completed form" });
    }
    const hasAccess = await form_helper.auth("Trainee", "update_cbda_form")(
      req,
      res
    );
    const hasAccessS = await form_helper.auth("Supervisor", "update_cbda_form")(
      req,
      res
    );

    console.log(hasAccess, hasAccessS, userId);

    let updateQuery = "";
    let updateValues = [];

    if (hasAccess) {
      if (
        existingRecord[0].resident_id !== userId ||
        Number(existingRecord[0].sent) === 0
      ) {
        form_helper.cleanupUploadedFiles(req.files);
        return res.status(403).json({ message: "Unauthorized access" });
      }

      let r_Signature = req.files?.signature
        ? req.files.signature[0].path
        : existingRecord[0].resident_signature;
      const residentSignature = form_helper.getPublicUrl(r_Signature);

      updateQuery = `UPDATE case_based_discussion_assessment 
                     SET resident_comment = ?, resident_signature = ?
                     WHERE id = ?`;

      updateValues = [
        resident_comment || existingRecord[0].resident_comment || null,
        residentSignature,
        id,
      ];
      await form_helper.sendSignatureToSupervisor(
        userId,
        "case_based_discussion_assessment",
        id
      );
    } else if (hasAccessS) {
      let a_signature = existingRecord[0].assessor_signature;

      if (req.files?.signature) {
        const newSignaturePath = req.files.signature[0].path;
        const newSignatureUrl = form_helper.getPublicUrl(newSignaturePath);

        await form_helper.deleteOldSignatureIfUpdated(
          "case_based_discussion_assessment",
          id,
          "assessor_signature",
          newSignatureUrl
        );

        a_signature = newSignatureUrl;
      }

      const assessorSignature = a_signature;

      const [old_send] = await pool.execute(
        `SELECT sent FROM case_based_discussion_assessment WHERE id = ?`,
        [id]
      );

      updateQuery = `
        UPDATE case_based_discussion_assessment 
        SET diagnosis = ?, case_complexity = ?, investigation_referral = ?, 
            treatment = ?, future_planning = ?, history_taking = ?, 
            overall_clinical_care = ?, assessor_comment = ?, agreed_action_plan = ?, assessor_signature = ?, sent = ?
        WHERE id = ?
      `;

      updateValues = [
        diagnosis ?? existingRecord[0].diagnosis ?? null,
        case_complexity ?? existingRecord[0].case_complexity ?? null,
        investigation_referral ??
          existingRecord[0].investigation_referral ??
          null,
        treatment ?? existingRecord[0].treatment ?? null,
        future_planning ?? existingRecord[0].future_planning ?? null,
        history_taking ?? existingRecord[0].history_taking ?? null,
        overall_clinical_care ??
          existingRecord[0].overall_clinical_care ??
          null,
        assessor_comment ?? existingRecord[0].assessor_comment ?? null,
        agreed_action_plan ?? existingRecord[0].agreed_action_plan ?? null,
        assessorSignature ?? null,
        draft_send,
        id,
      ];

      if (Number(draft_send) === 1 && Number(old_send[0].sent) === 0) {
        await form_helper.sendFormToTrainee(
          userId,
          "case_based_discussion_assessment",
          id
        );
      }
    } else {
      form_helper.cleanupUploadedFiles(req.files);
      return res.status(403).json({ message: "Permission denied" });
    }

    // Execute the update query only if it's been set
    if (updateQuery && updateValues.length > 0) {
      await pool.execute(updateQuery, updateValues);
      const [updatedRecord] = await pool.execute(
        `SELECT resident_signature, assessor_signature FROM case_based_discussion_assessment WHERE id = ?`,
        [id]
      );

      const { resident_signature, assessor_signature } = updatedRecord[0];
      if (resident_signature && assessor_signature) {
        await pool.execute(
          `UPDATE case_based_discussion_assessment SET completed = 1 WHERE id = ?`,
          [id]
        );
      }
      res.status(200).json({ message: "Form updated successfully" });
    } else {
      form_helper.cleanupUploadedFiles(req.files);
      res.status(400).json({ error: "No valid update parameters provided" });
    }
  } catch (err) {
    console.error("Database Error:", err);
    form_helper.cleanupUploadedFiles(req.files);
    res.status(500).json({ error: "Server error while updating form" });
  }
};

const getTupleById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute(
      `SELECT 
                u.Name AS resident_name,u_a.Name AS supervisor_name,
                cbd.date, cbd.diagnosis, cbd.case_complexity, cbd.investigation_referral, 
                cbd.treatment, cbd.future_planning, cbd.history_taking, cbd.overall_clinical_care, 
                cbd.assessor_comment AS supervisor_comment, cbd.resident_comment, cbd.agreed_action_plan,
                cbd.resident_signature, cbd.assessor_signature AS supervisor_signature
             FROM case_based_discussion_assessment cbd
             JOIN users u ON cbd.resident_id = u.User_ID
             JOIN users u_a ON cbd.supervisor_id = u_a.User_ID
             WHERE cbd.id = ?`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "Tuple not found" });
    }

    res.status(200).json(result[0]);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while fetching tuple" });
  }
};

const deleteTupleById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const [result] = await pool.execute(
      "SELECT * FROM case_based_discussion_assessment WHERE id = ?",
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "Tuple not found" });
    }

    if (result[0].supervisor_id !== userId && userId !== 1) {
      return res.status(403).json({
        message:
          "Permission denied: Only the assigned supervisor can delete this record",
      });
    }
    await form_helper.deleteSignatureFilesFromDB(
      "case_based_discussion_assessment",
      id,
      ["resident_signature", "assessor_signature"]
    );
    await pool.execute(
      "DELETE FROM case_based_discussion_assessment WHERE id = ?",
      [id]
    );
    res.status(200).json({ message: "Tuple deleted successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while deleting tuple" });
  }
};

module.exports = { createForm, updateForm, getTupleById, deleteTupleById };