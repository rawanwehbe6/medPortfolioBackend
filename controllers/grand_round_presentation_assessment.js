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
      draft_send,
    } = req.body;

    const assessor_signature = req.files?.signature
      ? req.files.signature[0].path
      : null;

    const [insertResult] = await pool.execute(
      `INSERT INTO grand_round_presentation_assessment 
        (resident_id, supervisor_id, diagnosis, case_complexity, history_taking, 
         physical_examination, provisional_diagnosis, treatment, future_planning, 
         assessor_comment, assessor_signature, sent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    res.status(500).json({ error: "Server error while creating form" });
  }
};

const updateForm = async (req, res) => {
  try {
    const { role, userId } = req.user;
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
      draft_send,
    } = req.body;

    const [existingRecord] = await pool.execute(
      `SELECT * FROM grand_round_presentation_assessment WHERE id = ?`,
      [id]
    );

    if (existingRecord.length === 0) {
      return res.status(404).json({ error: "Record not found" });
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
      if (existingRecord[0].resident_id !== userId) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      let residentSignature = req.files?.signature
        ? req.files.signature[0].path
        : existingRecord[0].resident_signature;

      const [old_send] = await pool.execute(
        `SELECT resident_signature FROM grand_round_presentation_assessment WHERE id = ?`,
        [id]
      );

      updateQuery = `UPDATE grand_round_presentation_assessment 
                           SET resident_comment = ?, resident_signature = ?
                           WHERE id = ?`;
      updateValues = [
        resident_comment ?? existingRecord[0].resident_comment ?? null,
        residentSignature ?? null,
        id,
      ];

      if (old_send[0].resident_signature === null)
        await form_helper.sendSignatureToSupervisor(
          userId,
          "grand_round_presentation_assessment",
          id
        );
    } else if (hasAccessS) {
      let assessorSignature = req.files?.signature
        ? req.files.signature[0].path
        : existingRecord[0].assessor_signature;

      const [old_send] = await pool.execute(
        `SELECT sent FROM grand_round_presentation_assessment WHERE id = ?`,
        [id]
      );

      updateQuery = `UPDATE grand_round_presentation_assessment 
                           SET diagnosis = ?, case_complexity = ?, history_taking = ?, 
                               physical_examination = ?, provisional_diagnosis = ?, 
                               treatment = ?, future_planning = ?, assessor_comment = ?, 
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
      res.status(400).json({ error: "No valid update parameters provided" });
    }
  } catch (err) {
    console.error("Database Error:", err);
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
