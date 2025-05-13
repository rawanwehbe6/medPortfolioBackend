const db = require('../config/db');
const upload = require('../middleware/multerConfig');
const form_helper = require('../middleware/form_helper');

// Create new Mortality & Morbidity form (only for supervisors/admins)
const createMortalityMorbidityForm = async (req, res) => {
  try {
    supervisor_id = req.user.userId;
    const {
      resident_id,
      date_of_presentation,
      diagnosis,
      cause_of_death_morbidity,
      brief_introduction,
      patient_details,
      assessment_analysis,
      review_of_literature,
      recommendations,
      handling_questions,
      overall_performance,
      major_positive_feature,
      suggested_areas_for_improvement,
      agreed_action_plan,
      draft_send,
    } = req.body;
    const [rows] = await db.execute(
      `SELECT Name FROM users WHERE User_id = ?`,
      [resident_id]
    );
    const resident_fellow_name = rows.length > 0 ? rows[0].Name : null;
    // Only assessor signature allowed on creation
    const a_signature = req.files?.signature
      ? req.files.signature[0].path
      : null;
    const assessor_signature_path = form_helper.getPublicUrl(a_signature);

    const [insertResult] = await db.execute(
      `INSERT INTO mortality_morbidity_review_assessment 
            (resident_id, supervisor_id, resident_fellow_name, date_of_presentation,
            diagnosis, cause_of_death_morbidity, brief_introduction, patient_details,
            assessment_analysis, review_of_literature, recommendations,
            handling_questions, overall_performance, major_positive_feature,
            suggested_areas_for_improvement, agreed_action_plan, assessor_signature_path, sent) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        supervisor_id,
        resident_fellow_name,
        date_of_presentation ?? null,
        diagnosis ?? null,
        cause_of_death_morbidity ?? null,
        brief_introduction ?? null,
        patient_details ?? null,
        assessment_analysis ?? null,
        review_of_literature ?? null,
        recommendations ?? null,
        handling_questions ?? null,
        overall_performance ?? null,
        major_positive_feature ?? null,
        suggested_areas_for_improvement ?? null,
        agreed_action_plan ?? null,
        assessor_signature_path ?? null,
        draft_send,
      ]
    );
    const formId = insertResult.insertId; // Get the newly inserted form ID
    if (Number(draft_send) === 1) {
      await form_helper.sendFormToTrainee(
        supervisor_id,
        "mortality_morbidity_review_assessment",
        formId
      );
    }

    res
      .status(201)
      .json({ message: "Mortality & Morbidity form created successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    form_helper.cleanupUploadedFiles(req.files);
    res.status(500).json({
      error: "Server error while creating Mortality & Morbidity form",
    });
  }
};

// Update Mortality & Morbidity form
const updateMortalityMorbidityForm = async (req, res) => {
  try {
    userId = req.user.userId;
    const { id } = req.params;

    // Get existing record first
    const [existingRecord] = await db.execute(
      `SELECT * FROM mortality_morbidity_review_assessment WHERE id = ?`,
      [id]
    );

    if (existingRecord.length === 0) {
      form_helper.cleanupUploadedFiles(req.files);
      return res
        .status(404)
        .json({ error: "Mortality & Morbidity form not found" });
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
      "update_mortality_morbidity_form"
    )(req, res);
    const hasAccessS = await form_helper.auth(
      "Supervisor",
      "update_mortality_morbidity_form"
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

      // Residents can only update their name and signature
      let r_Signature = req.files?.signature
        ? req.files.signature[0].path
        : existingRecord[0].resident_signature_path;
      const resident_signature_path = form_helper.getPublicUrl(r_Signature);

      updateQuery = `UPDATE mortality_morbidity_review_assessment 
                         SET resident_signature_path = ? 
                         WHERE id = ?`;
      updateValues = [resident_signature_path, id];
      await form_helper.sendSignatureToSupervisor(
        userId,
        "mortality_morbidity_review_assessment",
        id
      );
    } else if (hasAccessS) {
      // Admin or supervisor roles
      let a_signature = existingRecord[0].assessor_signature_path;

      if (req.files?.signature) {
        const newSignaturePath = req.files.signature[0].path;
        const newSignatureUrl = form_helper.getPublicUrl(newSignaturePath);

        await form_helper.deleteOldSignatureIfUpdated(
          "mortality_morbidity_review_assessment",
          id,
          "assessor_signature_path",
          newSignatureUrl
        );

        a_signature = newSignatureUrl;
      }

      const assessor_signature_path = a_signature;

      const [old_send] = await db.execute(
        `SELECT sent FROM mortality_morbidity_review_assessment WHERE id = ?`,
        [id]
      );

      updateQuery = `UPDATE mortality_morbidity_review_assessment 
                         SET diagnosis = ?, 
                             cause_of_death_morbidity = ?,
                             brief_introduction = ?,
                             patient_details = ?,
                             assessment_analysis = ?,
                             review_of_literature = ?,
                             recommendations = ?,
                             handling_questions = ?,
                             overall_performance = ?,
                             major_positive_feature = ?,
                             suggested_areas_for_improvement = ?,
                             agreed_action_plan = ?,
                             assessor_signature_path = ?,
                             sent = ?
                         WHERE id = ?`;
      updateValues = [
        req.body.diagnosis ?? currentRecord.diagnosis ?? null,
        req.body.cause_of_death_morbidity ??
          currentRecord.cause_of_death_morbidity ??
          null,
        req.body.brief_introduction ?? currentRecord.brief_introduction ?? null,
        req.body.patient_details ?? currentRecord.patient_details ?? null,
        req.body.assessment_analysis ??
          currentRecord.assessment_analysis ??
          null,
        req.body.review_of_literature ??
          currentRecord.review_of_literature ??
          null,
        req.body.recommendations ?? currentRecord.recommendations ?? null,
        req.body.handling_questions ?? currentRecord.handling_questions ?? null,
        req.body.overall_performance ??
          currentRecord.overall_performance ??
          null,
        req.body.major_positive_feature ??
          currentRecord.major_positive_feature ??
          null,
        req.body.suggested_areas_for_improvement ??
          currentRecord.suggested_areas_for_improvement ??
          null,
        req.body.agreed_action_plan ?? currentRecord.agreed_action_plan ?? null,
        assessor_signature_path,
        req.body.draft_send ?? currentRecord.sent ?? null,
        id,
      ];

      if (Number(req.body.draft_send) === 1 && Number(old_send[0].sent) === 0) {
        await form_helper.sendFormToTrainee(
          userId,
          "mortality_morbidity_review_assessment",
          id
        );
      }
    } else {
      form_helper.cleanupUploadedFiles(req.files);
      return res.status(403).json({ message: "Permission denied" });
    }

    await db.execute(updateQuery, updateValues);
    const [updatedRecord] = await db.execute(
      `SELECT resident_signature_path, assessor_signature_path FROM mortality_morbidity_review_assessment WHERE id = ?`,
      [id]
    );

    const { resident_signature_path, assessor_signature_path } =
      updatedRecord[0];
    if (resident_signature_path && assessor_signature_path) {
      await db.execute(
        `UPDATE mortality_morbidity_review_assessment SET completed = 1 WHERE id = ?`,
        [id]
      );
    }
    res
      .status(200)
      .json({ message: "Mortality & Morbidity form updated successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    form_helper.cleanupUploadedFiles(req.files);
    res.status(500).json({
      error: "Server error while updating Mortality & Morbidity form",
    });
  }
};

// Get Mortality & Morbidity form by ID
const getMortalityMorbidityFormById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch form with resident name
    const [result] = await db.execute(
      `SELECT 
        mm.resident_fellow_name AS resident_name,
        mm.date_of_presentation,
        mm.diagnosis,
        mm.cause_of_death_morbidity,
        mm.brief_introduction,
        mm.patient_details,
        mm.assessment_analysis,
        mm.review_of_literature,
        mm.recommendations,
        mm.handling_questions,
        mm.overall_performance,
        mm.major_positive_feature,
        mm.suggested_areas_for_improvement,
        mm.agreed_action_plan,
        mm.resident_signature_path AS resident_signature,
        mm.assessor_signature_path AS assessor_signature,
        u_supervisor.Name AS supervisor_name
     FROM mortality_morbidity_review_assessment mm
     JOIN users u_resident ON mm.resident_id = u_resident.User_ID
     JOIN users u_supervisor ON mm.supervisor_id = u_supervisor.User_ID
     WHERE mm.id = ?`,
      [id]
    );

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "Mortality & Morbidity form not found" });
    }
    res.status(200).json(result[0]);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({
      error: "Server error while fetching Mortality & Morbidity form",
    });
  }
};

// Delete Mortality & Morbidity form
const deleteMortalityMorbidityForm = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        // Check if form exists
        const [existingRecord] = await db.execute(
            "SELECT * FROM mortality_morbidity_review_assessment WHERE id = ?",
            [id]
        );

        if (existingRecord.length === 0) {
            return res.status(404).json({ error: "Mortality & Morbidity form not found" });
        }

        const form = existingRecord[0];

        // Check permission
        if (form.supervisor_id !== userId && userId !== 1) {
            return res.status(403).json({ error: "You do not have permission to delete this form." });
        }
        
        await form_helper.deleteSignatureFilesFromDB(
            "mortality_morbidity_review_assessment",
            id,
            ["resident_signature_path", "assessor_signature_path"]
        );
        
        await db.execute(
            "DELETE FROM mortality_morbidity_review_assessment WHERE id = ?", 
            [id]
        );
        return res.status(200).json({ message: "Mortality & Morbidity form deleted successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Server error while deleting Mortality & Morbidity form" });
    }
};

module.exports = { 
    createMortalityMorbidityForm, 
    updateMortalityMorbidityForm, 
    getMortalityMorbidityFormById, 
    deleteMortalityMorbidityForm 
};