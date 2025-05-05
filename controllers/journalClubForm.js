const pool = require("../config/db");
const form_helper = require("../middleware/form_helper");

const createForm = async (req, res) => {
  try {
    const { userId: supervisor_id } = req.user;

    const {
      resident_id,
      date,
      article_reference,
      paper_selection,
      background_knowledge,
      critical_analysis_methodology,
      critical_analysis_results,
      conclusions_drawn,
      audio_visual_aids,
      handling_questions,
      overall_performance,
      major_positive_feature,
      comments,
      agreed_action_plan,
      draft_send,
    } = req.body;

    // Get resident name
    const [rows] = await pool.execute(
      `SELECT Name FROM users WHERE User_id = ?`,
      [resident_id]
    );
    const resident_name = rows[0].Name;

    const a_signature = req.files?.signature
      ? req.files.signature[0].path
      : null;
    const assessor_signature = form_helper.getPublicUrl(a_signature);

    const [insertResult] = await pool.execute(
      `INSERT INTO journal_club_assessment 
       (resident_id, resident_name, supervisor_id, date, article_reference, paper_selection, 
        background_knowledge, critical_analysis_methodology, critical_analysis_results, 
        conclusions_drawn, audio_visual_aids, handling_questions, overall_performance, 
        major_positive_feature, comments,
        agreed_action_plan, assessor_signature, sent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id,
        resident_name,
        supervisor_id,
        date ?? null,
        article_reference ?? null,
        paper_selection ?? null,
        background_knowledge ?? null,
        critical_analysis_methodology ?? null,
        critical_analysis_results ?? null,
        conclusions_drawn ?? null,
        audio_visual_aids ?? null,
        handling_questions ?? null,
        overall_performance ?? null,
        major_positive_feature ?? null,
        comments ?? null,
        agreed_action_plan ?? null,
        assessor_signature ?? null,
        draft_send,
      ]
    );

    const formId = insertResult.insertId;

    if (Number(draft_send) === 1) {
      await form_helper.sendFormToTrainee(
        supervisor_id,
        "journal_club_assessment",
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
      article_reference,
      paper_selection,
      background_knowledge,
      critical_analysis_methodology,
      critical_analysis_results,
      conclusions_drawn,
      audio_visual_aids,
      handling_questions,
      overall_performance,
      major_positive_feature,
      comments,
      agreed_action_plan,
      draft_send,
    } = req.body;

    const [existingRecord] = await pool.execute(
      `SELECT * FROM journal_club_assessment WHERE id = ?`,
      [id]
    );

    if (existingRecord.length === 0) {
      form_helper.cleanupUploadedFiles(req.files);
      return res.status(404).json({ error: "Record not found" });
    }
    if (Number(existingRecord[0].complete) === 1) {
      form_helper.cleanupUploadedFiles(req.files);
      return res
        .status(403)
        .json({ error: "You cannot edit a completed form" });
    }
    const hasAccess = await form_helper.auth(
      "Trainee",
      "update_journal_club_form"
    )(req, res);
    const hasAccessS = await form_helper.auth(
      "Supervisor",
      "update_journal_club_form"
    )(req, res);

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

      updateQuery = `UPDATE journal_club_assessment 
                     SET resident_signature = ?
                     WHERE id = ?`;
      updateValues = [residentSignature ?? null, id];
      await form_helper.sendSignatureToSupervisor(
        userId,
        "journal_club_assessment",
        id
      );
    } else if (hasAccessS) {
      let a_signature = existingRecord[0].assessor_signature;

      if (req.files?.signature) {
        const newSignaturePath = req.files.signature[0].path;
        const newSignatureUrl = form_helper.getPublicUrl(newSignaturePath);

        await form_helper.deleteOldSignatureIfUpdated(
          "journal_club_assessment",
          id,
          "assessor_signature",
          newSignatureUrl
        );

        a_signature = newSignatureUrl;
      }

      const assessorSignature = a_signature;

      const [old_send] = await pool.execute(
        `SELECT sent FROM journal_club_assessment WHERE id = ?`,
        [id]
      );

      updateQuery = `UPDATE journal_club_assessment 
                     SET article_reference = ?,
                         paper_selection = ?,
                         background_knowledge = ?,
                         critical_analysis_methodology = ?,
                         critical_analysis_results = ?,
                         conclusions_drawn = ?,
                         audio_visual_aids = ?,
                         handling_questions = ?,
                         overall_performance = ?,
                         major_positive_feature = ?,
                         comments = ?,
                         agreed_action_plan = ?,
                         assessor_signature = ?,
                         sent = ?
                     WHERE id = ?`;

      updateValues = [
        article_reference ?? existingRecord[0].article_reference ?? null,
        paper_selection ?? existingRecord[0].paper_selection ?? null,
        background_knowledge ?? existingRecord[0].background_knowledge ?? null,
        critical_analysis_methodology ??
          existingRecord[0].critical_analysis_methodology ??
          null,
        critical_analysis_results ??
          existingRecord[0].critical_analysis_results ??
          null,
        conclusions_drawn ?? existingRecord[0].conclusions_drawn ?? null,
        audio_visual_aids ?? existingRecord[0].audio_visual_aids ?? null,
        handling_questions ?? existingRecord[0].handling_questions ?? null,
        overall_performance ?? existingRecord[0].overall_performance ?? null,
        major_positive_feature ??
          existingRecord[0].major_positive_feature ??
          null,
        comments ?? existingRecord[0].comments ?? null,
        agreed_action_plan ?? existingRecord[0].agreed_action_plan ?? null,
        assessorSignature ?? null,
        draft_send,
        id,
      ];

      if (Number(draft_send) === 1 && Number(old_send[0].sent) === 0) {
        await form_helper.sendFormToTrainee(
          userId,
          "journal_club_assessment",
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
        `SELECT resident_signature, assessor_signature FROM journal_club_assessment WHERE id = ?`,
        [id]
      );

      const { resident_signature, assessor_signature } = updatedRecord[0];
      if (resident_signature && assessor_signature) {
        await pool.execute(
          `UPDATE journal_club_assessment SET complete = 1 WHERE id = ?`,
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
         jca.resident_name AS resident_name,
         u_supervisor.Name AS supervisor_name,
         jca.date,
         jca.article_reference,
         jca.paper_selection,
         jca.background_knowledge,
         jca.critical_analysis_methodology,
         jca.critical_analysis_results,
         jca.conclusions_drawn,
         jca.audio_visual_aids,
         jca.handling_questions,
         jca.overall_performance,
         jca.major_positive_feature,
         jca.comments,
         jca.agreed_action_plan,
         jca.resident_signature,
         jca.assessor_signature AS supervisor_signature
       FROM journal_club_assessment jca
       JOIN users u_resident ON jca.resident_id = u_resident.User_ID
       JOIN users u_supervisor ON jca.supervisor_id = u_supervisor.User_ID
       WHERE jca.id = ?`,
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
      "SELECT * FROM journal_club_assessment WHERE id = ?",
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
      "journal_club_assessment",
      id,
      ["resident_signature", "assessor_signature"]
    );

    await pool.execute("DELETE FROM journal_club_assessment WHERE id = ?", [
      id,
    ]);

    res.status(200).json({ message: "Tuple deleted successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while deleting tuple" });
  }
};

module.exports = { createForm, updateForm, getTupleById, deleteTupleById };
