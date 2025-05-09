const db = require("../config/db");
const form_helper = require("../middleware/form_helper");

// Create new Seminar Assessment form (only for supervisors/admins)
const createSeminarAssessment = async (req, res) => {
  try {
    const { role, userId: supervisor_id } = req.user;

    const {
      resident_id,
      date_of_presentation,
      topic,
      content,
      presentation_skills,
      audio_visual_aids,
      communication,
      handling_questions,
      audience_management,
      references,
      major_positive_feature,
      suggested_areas_for_improvement,
      agreed_action_plan,
      draft_send,
    } = req.body;

    const [rows] = await db.execute(
      `SELECT Name FROM users WHERE User_id = ?`,
      [resident_id]
    );
    const resident_fellow_name = rows[0].Name;

    // Only assessor signature allowed on creation
    const a_signature = req.files?.signature
      ? req.files.signature[0].path
      : null;
    const assessor_signature_path = form_helper.getPublicUrl(a_signature);

    const [insertResult] = await db.execute(
      `INSERT INTO seminar_assessment 
            (resident_id, supervisor_id, resident_fellow_name, date_of_presentation,
            topic, content, presentation_skills, audio_visual_aids,
            communication, handling_questions, audience_management,
            \`references\`, major_positive_feature, suggested_areas_for_improvement,
            agreed_action_plan, assessor_signature_path, sent) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        supervisor_id,
        resident_fellow_name,
        date_of_presentation ?? null,
        topic ?? null,
        content ?? null,
        presentation_skills ?? null,
        audio_visual_aids ?? null,
        communication ?? null,
        handling_questions ?? null,
        audience_management ?? null,
        references ?? null,
        major_positive_feature ?? null,
        suggested_areas_for_improvement ?? null,
        agreed_action_plan ?? null,
        assessor_signature_path ?? null,
        draft_send,
      ]
    );

    const formId = insertResult.insertId;

    if (Number(draft_send) === 1) {
      await form_helper.sendFormToTrainee(
        supervisor_id,
        "seminar_assessment",
        formId
      );
    }

    res
      .status(201)
      .json({ message: "Seminar Assessment form created successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    form_helper.cleanupUploadedFiles(req.files);
    res
      .status(500)
      .json({ error: "Server error while creating Seminar Assessment form" });
  }
};

// Update Seminar Assessment form
const updateSeminarAssessment = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id } = req.params;

    const [existingRecord] = await db.execute(
      `SELECT * FROM seminar_assessment WHERE id = ?`,
      [id]
    );

    if (existingRecord.length === 0) {
      form_helper.cleanupUploadedFiles(req.files);
      return res
        .status(404)
        .json({ error: "Seminar Assessment form not found" });
    }

    if (Number(existingRecord[0].completed) === 1) {
      form_helper.cleanupUploadedFiles(req.files);
      return res
        .status(403)
        .json({ error: "You cannot edit a completed form" });
    }

    const currentRecord = existingRecord[0];
    let updateQuery = "";
    let updateValues = [];

    const hasAccess = await form_helper.auth(
      "Trainee",
      "update_seminar_assessment"
    )(req, res);
    const hasAccessS = await form_helper.auth(
      "Supervisor",
      "update_seminar_assessment"
    )(req, res);

    if (hasAccess) {
      // Residents can only update their own forms
      if (
        currentRecord.resident_id !== userId ||
        Number(existingRecord[0].sent) === 0
      ) {
        form_helper.cleanupUploadedFiles(req.files);
        return res.status(403).json({ message: "Unauthorized access" });
      }

      // Residents can only update their signature
      let r_Signature = req.files?.signature
        ? req.files.signature[0].path
        : existingRecord[0].resident_signature_path;
      const resident_signature_path = form_helper.getPublicUrl(r_Signature);

      updateQuery = `UPDATE seminar_assessment 
                     SET resident_signature_path = ? 
                     WHERE id = ?`;
      updateValues = [resident_signature_path ?? null, id];

      await form_helper.sendSignatureToSupervisor(
        userId,
        "seminar_assessment",
        id
      );
    } else if (hasAccessS) {
      // Admin or supervisor roles can update all fields except resident signature
      let a_signature = existingRecord[0].assessor_signature_path;

      if (req.files?.signature) {
        const newSignaturePath = req.files.signature[0].path;
        const newSignatureUrl = form_helper.getPublicUrl(newSignaturePath);

        await form_helper.deleteOldSignatureIfUpdated(
          "seminar_assessment",
          id,
          "assessor_signature_path",
          newSignatureUrl
        );

        a_signature = newSignatureUrl;
      }

      const assessor_signature_path = a_signature;

      const [old_send] = await db.execute(
        `SELECT sent FROM seminar_assessment WHERE id = ?`,
        [id]
      );

      updateQuery = `UPDATE seminar_assessment 
                     SET topic = ?,
                         content = ?,
                         presentation_skills = ?,
                         audio_visual_aids = ?,
                         communication = ?,
                         handling_questions = ?,
                         audience_management = ?,
                         \`references\` = ?,
                         major_positive_feature = ?,
                         suggested_areas_for_improvement = ?,
                         agreed_action_plan = ?,
                         assessor_signature_path = ?, 
                         sent = ?
                     WHERE id = ?`;
      updateValues = [
        req.body.topic ?? currentRecord.topic ?? null,
        req.body.content ?? currentRecord.content ?? null,
        req.body.presentation_skills ??
          currentRecord.presentation_skills ??
          null,
        req.body.audio_visual_aids ?? currentRecord.audio_visual_aids ?? null,
        req.body.communication ?? currentRecord.communication ?? null,
        req.body.handling_questions ?? currentRecord.handling_questions ?? null,
        req.body.audience_management ??
          currentRecord.audience_management ??
          null,
        req.body.references ?? currentRecord.references ?? null,
        req.body.major_positive_feature ??
          currentRecord.major_positive_feature ??
          null,
        req.body.suggested_areas_for_improvement ??
          currentRecord.suggested_areas_for_improvement ??
          null,
        req.body.agreed_action_plan ?? currentRecord.agreed_action_plan ?? null,
        assessor_signature_path ?? null,
        req.body.draft_send ?? currentRecord.sent ?? null,
        id,
      ];

      if (Number(req.body.draft_send) === 1 && Number(old_send[0].sent) === 0) {
        await form_helper.sendFormToTrainee(userId, "seminar_assessment", id);
      }
    } else {
      form_helper.cleanupUploadedFiles(req.files);
      return res.status(403).json({ message: "Permission denied" });
    }

    if (updateQuery && updateValues.length > 0) {
      await db.execute(updateQuery, updateValues);

      const [updatedRecord] = await db.execute(
        `SELECT resident_signature_path, assessor_signature_path FROM seminar_assessment WHERE id = ?`,
        [id]
      );

      const { resident_signature_path, assessor_signature_path } =
        updatedRecord[0];
      if (resident_signature_path && assessor_signature_path) {
        await db.execute(
          `UPDATE seminar_assessment SET completed = 1 WHERE id = ?`,
          [id]
        );
      }

      res
        .status(200)
        .json({ message: "Seminar Assessment form updated successfully" });
    } else {
      form_helper.cleanupUploadedFiles(req.files);
      res.status(400).json({ error: "No valid update parameters provided" });
    }
  } catch (err) {
    console.error("Database Error:", err);
    form_helper.cleanupUploadedFiles(req.files);
    res
      .status(500)
      .json({ error: "Server error while updating Seminar Assessment form" });
  }
};

// Get Seminar Assessment form by ID
const getSeminarAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch form with resident name
    const [result] = await db.execute(
      `SELECT 
        sa.resident_fellow_name AS resident_name,
        u_supervisor.Name AS supervisor_name,
        sa.date_of_presentation,
        sa.topic,
        sa.content,
        sa.presentation_skills,
        sa.audio_visual_aids,
        sa.communication,
        sa.handling_questions,
        sa.audience_management,
        sa.references,
        sa.major_positive_feature,
        sa.suggested_areas_for_improvement,
        sa.agreed_action_plan,
        sa.resident_signature_path AS resident_signature,
        sa.assessor_signature_path AS assessor_signature
     FROM seminar_assessment sa
     JOIN users u_resident ON sa.resident_id = u_resident.User_ID
     JOIN users u_supervisor ON sa.supervisor_id = u_supervisor.User_ID
     WHERE sa.id = ?`,
      [id]
    );

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "Seminar Assessment form not found" });
    }

    res.status(200).json(result[0]);
  } catch (err) {
    console.error("Database Error:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching Seminar Assessment form" });
  }
};

// Delete Seminar Assessment form
const deleteSeminarAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    // First check if form exists
    const [existingRecord] = await db.execute(
      "SELECT * FROM seminar_assessment WHERE id = ?",
      [id]
    );

    if (existingRecord.length === 0) {
      return res
        .status(404)
        .json({ error: "Seminar Assessment form not found" });
    }

    const form = existingRecord[0];

    // Check permissions
    if (form.supervisor_id !== userId && userId !== 1) {
      return res.status(403).json({
        message:
          "Permission denied: Only the assigned supervisor can delete this record",
      });
    }

    await form_helper.deleteSignatureFilesFromDB("seminar_assessment", id, [
      "resident_signature_path",
      "assessor_signature_path",
    ]);

    await db.execute("DELETE FROM seminar_assessment WHERE id = ?", [id]);

    res
      .status(200)
      .json({ message: "Seminar Assessment form deleted successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res
      .status(500)
      .json({ error: "Server error while deleting Seminar Assessment form" });
  }
};

module.exports = {
  createSeminarAssessment,
  updateSeminarAssessment,
  getSeminarAssessmentById,
  deleteSeminarAssessment,
};
