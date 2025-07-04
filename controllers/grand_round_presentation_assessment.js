const pool = require("../config/db");
const form_helper = require('../middleware/form_helper');
const createForm = async (req, res) => {
  try {
    const { userId: supervisor_id } = req.user;

    const {
      resident_id,
      diagnosis,
      case_complexity,
      history_taking,
      physical_examination,
      provisional_diagnosis,
      treatment,
      future_planning,
      assessor_comment,
      AgreedAction,
      draft_send,
    } = req.body;

    const a_signature = req.files?.signature
      ? req.files.signature[0].path
      : null;
    const assessor_signature = form_helper.getPublicUrl(a_signature);

    // If the form is being sent (not a draft), check form limits
    if (Number(draft_send) === 1) {
      const limitCheck = await form_helper.checkFormLimitAndCleanDrafts(
        resident_id,
        "grand_round_presentation_assessment"
      );
      
      if (!limitCheck.success) {
        form_helper.cleanupUploadedFiles(req.files);
        return res.status(500).json({ error: limitCheck.message });
      }
      
      if (!limitCheck.canSubmit) {
        form_helper.cleanupUploadedFiles(req.files);
        return res.status(400).json({ 
          error: limitCheck.message,
          deletedDrafts: limitCheck.deletedDrafts 
        });
      }
    }

    const [insertResult] = await pool.execute(
      `INSERT INTO grand_round_presentation_assessment 
        (resident_id, supervisor_id, diagnosis, case_complexity, history_taking, 
         physical_examination, provisional_diagnosis, treatment, future_planning, 
         assessor_comment, AgreedAction, assessor_signature, sent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        supervisor_id,
        diagnosis ?? null,
        case_complexity ?? null,
        history_taking ?? null,
        physical_examination ?? null,
        provisional_diagnosis ?? null,
        treatment ?? null,
        future_planning ?? null,
        assessor_comment ?? null,
        AgreedAction ?? null,
        assessor_signature ?? null,
        draft_send,
      ]
    );

    const formId = insertResult.insertId;

    if (Number(draft_send) === 1) {
      await form_helper.sendFormToTrainee(
        supervisor_id,
        "grand_round_presentation_assessment",
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
      history_taking,
      physical_examination,
      provisional_diagnosis,
      treatment,
      future_planning,
      assessor_comment,
      resident_comment,
      AgreedAction,
      draft_send,
    } = req.body;

    const [existingRecord] = await pool.execute(
      `SELECT * FROM grand_round_presentation_assessment WHERE id = ?`,
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
    const hasAccess = await form_helper.auth("Trainee", "update_grpa_form")(
      req,
      res
    );
    const hasAccessS = await form_helper.auth("Supervisor", "update_grpa_form")(
      req,
      res
    );

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

      updateQuery = `UPDATE grand_round_presentation_assessment 
                           SET resident_comment = ?, resident_signature = ?
                           WHERE id = ?`;
      updateValues = [
        resident_comment ?? existingRecord[0].resident_comment ?? null,
        residentSignature ?? null,
        id,
      ];

      await form_helper.sendSignatureToSupervisor(
        userId,
        "grand_round_presentation_assessment",
        id
      );
    } else if (hasAccessS) {
      let a_signature = existingRecord[0].assessor_signature;

      if (req.files?.signature) {
        const newSignaturePath = req.files.signature[0].path;
        const newSignatureUrl = form_helper.getPublicUrl(newSignaturePath);

        await form_helper.deleteOldSignatureIfUpdated(
          "grand_round_presentation_assessment",
          id,
          "assessor_signature",
          newSignatureUrl
        );

        a_signature = newSignatureUrl;
      }

      const assessorSignature = a_signature;

      const [old_send] = await pool.execute(
        `SELECT sent FROM grand_round_presentation_assessment WHERE id = ?`,
        [id]
      );
      
      // If changing from draft to sent, check form limits
      if (Number(draft_send) === 1 && Number(old_send[0].sent) === 0) {
        const limitCheck = await form_helper.checkFormLimitAndCleanDrafts(
          existingRecord[0].resident_id,
          "grand_round_presentation_assessment",
          id
        );
        
        if (!limitCheck.success) {
          form_helper.cleanupUploadedFiles(req.files);
          return res.status(500).json({ error: limitCheck.message });
        }
        
        if (!limitCheck.canSubmit) {
          form_helper.cleanupUploadedFiles(req.files);
          return res.status(400).json({ 
            error: limitCheck.message,
            deletedDrafts: limitCheck.deletedDrafts 
          });
        }
      }

      updateQuery = `UPDATE grand_round_presentation_assessment 
                           SET diagnosis = ?, case_complexity = ?, history_taking = ?, 
                               physical_examination = ?, provisional_diagnosis = ?, 
                               treatment = ?, future_planning = ?, assessor_comment = ?,AgreedAction =?, 
                               assessor_signature = ?, sent = ?
                           WHERE id = ?`;

      updateValues = [
        diagnosis ?? existingRecord[0].diagnosis ?? null,
        case_complexity ?? existingRecord[0].case_complexity ?? null,
        history_taking ?? existingRecord[0].history_taking ?? null,
        physical_examination ?? existingRecord[0].physical_examination ?? null,
        provisional_diagnosis ??
          existingRecord[0].provisional_diagnosis ??
          null,
        treatment ?? existingRecord[0].treatment ?? null,
        future_planning ?? existingRecord[0].future_planning ?? null,
        assessor_comment ?? existingRecord[0].assessor_comment ?? null,
        AgreedAction ?? existingRecord[0].AgreedAction ?? null,
        assessorSignature ?? null,
        draft_send,
        id,
      ];

      if (Number(draft_send) === 1 && Number(old_send[0].sent) === 0) {
        await form_helper.sendFormToTrainee(
          userId,
          "grand_round_presentation_assessment",
          id
        );
      }
    } else {
      form_helper.cleanupUploadedFiles(req.files);
      return res.status(403).json({ message: "Permission denied" });
    }

    if (updateQuery && updateValues.length > 0) {
      await pool.execute(updateQuery, updateValues);

      const [updatedRecord] = await pool.execute(
        `SELECT resident_signature, assessor_signature FROM grand_round_presentation_assessment WHERE id = ?`,
        [id]
      );

      const { resident_signature, assessor_signature } = updatedRecord[0];
      if (resident_signature && assessor_signature) {
        await pool.execute(
          `UPDATE grand_round_presentation_assessment SET completed = 1 WHERE id = ?`,
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
         u.Name AS resident_name,
         u_a.Name AS supervisor_name,
         gra.date,
         gra.diagnosis,
         gra.case_complexity,
         gra.history_taking,
         gra.physical_examination,
         gra.provisional_diagnosis,
         gra.treatment,
         gra.AgreedAction,
         gra.future_planning,
         gra.assessor_comment AS supervisor_comment,
         gra.resident_comment,
         gra.resident_signature,
         gra.assessor_signature AS supervisor_signature
       FROM grand_round_presentation_assessment gra
       JOIN users u ON gra.resident_id = u.User_ID
       JOIN users u_a ON gra.supervisor_id = u_a.User_ID
       WHERE gra.id = ?`,
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
      "SELECT * FROM grand_round_presentation_assessment WHERE id = ?",
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
      "grand_round_presentation_assessment",
      id,
      ["resident_signature", "assessor_signature"]
    );
    await pool.execute(
      "DELETE FROM grand_round_presentation_assessment WHERE id = ?",
      [id]
    );

    res.status(200).json({ message: "Tuple deleted successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while deleting tuple" });
  }
};

module.exports = { createForm, updateForm, getTupleById, deleteTupleById };
