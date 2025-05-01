const pool = require("../config/db");

const isSupervisorOfTrainee = async (supervisorId, traineeId) => {
  const query = `
    SELECT 1 FROM supervisor_supervisee 
    WHERE SupervisorID = ? AND SuperviseeID = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [supervisorId, traineeId]);
  return rows.length > 0;
};

const getFormById = async (req, res) => {
  try {
    const { formName, formId, traineeId } = req.body;
    const { userId, role } = req.user;

    if (!formName || !formId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    let effectiveTraineeId = traineeId;
    try {
      const [existing] = await pool.execute(
        "SELECT Type FROM usertypes WHERE Id = ?",
        [role]
      );

      if (existing.length > 0 && existing[0].Type === "Trainee") {
        effectiveTraineeId = userId;
      }
    } catch (err) {
      console.error("Error checking user type:", err);
    }

    const isTraineeSelf = Number(effectiveTraineeId) === Number(userId);
    const isSupervisor = await isSupervisorOfTrainee(
      userId,
      effectiveTraineeId
    );

    if (!isTraineeSelf && !isSupervisor && role !== 1) {
      return res.status(403).json({
        error:
          "Permission denied: You can only access your own forms or forms of trainees you supervise",
      });
    }

    const formConfig = {
      grand_round_presentation_assessment: {
        query: `SELECT 
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
          gra.assessor_signature AS supervisor_signature,
          gra.resident_id,
          gra.supervisor_id,
          gra.sent,
          gra.completed
        FROM grand_round_presentation_assessment gra
        JOIN users u ON gra.resident_id = u.User_ID
        JOIN users u_a ON gra.supervisor_id = u_a.User_ID
        WHERE gra.id = ?`,
        field: "resident_id",
        sentCol: "sent",
        completeCol: "completed",
        inverse: false,
      },
      case_based_discussion_assessment: {
        query: `SELECT 
          u.Name AS resident_name,
          u_a.Name AS supervisor_name,
          cbd.date, 
          cbd.diagnosis, 
          cbd.case_complexity, 
          cbd.investigation_referral, 
          cbd.treatment, 
          cbd.future_planning, 
          cbd.history_taking, 
          cbd.overall_clinical_care, 
          cbd.assessor_comment AS supervisor_comment, 
          cbd.resident_comment, 
          cbd.resident_signature, 
          cbd.assessor_signature AS supervisor_signature,
          cbd.resident_id,
          cbd.supervisor_id,
          cbd.sent,
          cbd.completed
        FROM case_based_discussion_assessment cbd
        JOIN users u ON cbd.resident_id = u.User_ID
        JOIN users u_a ON cbd.supervisor_id = u_a.User_ID
        WHERE cbd.id = ?`,
        field: "resident_id",
        sentCol: "sent",
        completeCol: "completed",
        inverse: false,
      },
      dops: {
        query: `SELECT 
          d.*,
          u1.Name AS trainee_name, 
          u2.Name AS supervisor_name
        FROM dops d
        JOIN users u1 ON d.trainee_id = u1.User_ID
        JOIN users u2 ON d.supervisor_id = u2.User_ID
        WHERE d.id = ?`,
        field: "trainee_id",
        sentCol: "is_sent_to_trainee",
        completeCol: "is_draft",
        inverse: true,
      },
      fellow_resident_evaluation: {
        query: `SELECT 
          fre.*, 
          u.Name AS resident_name
        FROM fellow_resident_evaluation fre
        JOIN users u ON fre.fellow_id = u.User_ID
        WHERE fre.id = ?`,
        field: "fellow_id",
        sentCol: "sent",
        completeCol: "completed",
        inverse: false,
      },
      journal_club_assessment: {
        query: `SELECT 
          jca.*,
          u1.Name AS resident_name,
          u2.Name AS supervisor_name 
        FROM journal_club_assessment jca
        JOIN users u1 ON jca.resident_id = u1.User_ID
        JOIN users u2 ON jca.supervisor_id = u2.User_ID
        WHERE jca.id = ?`,
        field: "resident_id",
        sentCol: "sent",
        completeCol: "complete",
        inverse: false,
      },
      mini_cex: {
        query: `SELECT 
          mc.*, 
          u1.Name AS trainee_name, 
          u2.Name AS supervisor_name
        FROM mini_cex mc
        JOIN users u1 ON mc.trainee_id = u1.User_ID
        JOIN users u2 ON mc.supervisor_id = u2.User_ID
        WHERE mc.id = ?`,
        field: "trainee_id",
        sentCol: "sent_to_trainee",
        completeCol: "is_draft",
        inverse: true,
      },
      mortality_morbidity_review_assessment: {
        query: `SELECT 
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
          mm.resident_signature_path AS resident_signature,
          mm.assessor_signature_path AS assessor_signature,
          u_supervisor.Name AS supervisor_name,
          mm.resident_id,
          mm.supervisor_id,
          mm.sent,
          mm.completed
        FROM mortality_morbidity_review_assessment mm
        JOIN users u_resident ON mm.resident_id = u_resident.User_ID
        JOIN users u_supervisor ON mm.supervisor_id = u_supervisor.User_ID
        WHERE mm.id = ?`,
        field: "resident_id",
        sentCol: "sent",
        completeCol: "completed",
        inverse: false,
      },
      seminar_assessment: {
        query: `SELECT 
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
          sa.resident_signature_path AS resident_signature,
          sa.assessor_signature_path AS assessor_signature,
          sa.resident_id,
          sa.supervisor_id,
          sa.sent,
          sa.completed
        FROM seminar_assessment sa
        JOIN users u_resident ON sa.resident_id = u_resident.User_ID
        JOIN users u_supervisor ON sa.supervisor_id = u_supervisor.User_ID
        WHERE sa.id = ?`,
        field: "resident_id",
        sentCol: "sent",
        completeCol: "completed",
        inverse: false,
      },
    };

    if (!formConfig[formName]) {
      return res.status(400).json({ error: "Invalid form name" });
    }

    const { query, field, sentCol, completeCol, inverse } =
      formConfig[formName];
    const [results] = await pool.execute(query, [formId]);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: `${formName.replace(/_/g, " ")} form not found` });
    }

    const form = results[0];
    const formTraineeId = form[field];

    if (Number(formTraineeId) !== Number(effectiveTraineeId)) {
      return res.status(403).json({
        error: "This form does not belong to the specified trainee",
      });
    }

    const isSent = form[sentCol] === 1;
    const isCompleted = inverse
      ? form[completeCol] === 0
      : form[completeCol] === 1;

    if (role === 1) {
      return res.status(200).json(form);
    }

    if (isTraineeSelf) {
      if (!isSent) {
        return res
          .status(404)
          .json({ error: `${formName.replace(/_/g, " ")} form not found` });
      }
      return res.status(200).json(form);
    }

    if (isSupervisor) {
      return res.status(200).json(form);
    }
    return res.status(500).json({ error: "Unexpected error occurred" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while fetching form data" });
  }
};

const getCompletedFormsById = async (req, res) => {
  try {
    const { traineeId } = req.body;
    const { userId, role } = req.user;

    if (!traineeId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    let effectiveTraineeId = traineeId;

    try {
      const [existing] = await pool.execute(
        "SELECT Type FROM usertypes WHERE Id = ?",
        [role]
      );

      if (existing.length > 0 && existing[0].Type === "Trainee") {
        effectiveTraineeId = userId;
      }
    } catch (err) {
      console.error("Error checking user type:", err);
    }

    const isTraineeSelf = Number(effectiveTraineeId) === Number(userId);
    const isSupervisor = await isSupervisorOfTrainee(
      userId,
      effectiveTraineeId
    );

    if (!isTraineeSelf && !isSupervisor && role !== 1) {
      return res.status(403).json({
        error:
          "Permission denied: You can only access your own forms or forms of trainees you supervise",
      });
    }

    const formTables = {
      grand_round_presentation_assessment: {
        query: `SELECT id FROM grand_round_presentation_assessment WHERE resident_id = ? AND completed = 1`,
      },
      case_based_discussion_assessment: {
        query: `SELECT id FROM case_based_discussion_assessment WHERE resident_id = ? AND completed = 1`,
      },
      dops: {
        query: `SELECT id FROM dops WHERE trainee_id = ? AND is_draft = 0`,
      },
      fellow_resident_evaluation: {
        query: `SELECT id FROM fellow_resident_evaluation WHERE fellow_id = ? AND completed = 1`,
      },
      journal_club_assessment: {
        query: `SELECT id FROM journal_club_assessment WHERE resident_id = ? AND complete = 1`,
      },
      mini_cex: {
        query: `SELECT id FROM mini_cex WHERE resident_id = ? AND is_draft = 0`,
      },
      mortality_morbidity_review_assessment: {
        query: `SELECT id FROM mortality_morbidity_review_assessment WHERE resident_id = ? AND completed = 1`,
      },
      seminar_assessment: {
        query: `SELECT id FROM seminar_assessment WHERE resident_id = ? AND completed = 1`,
      },
    };

    const formsResult = {};

    for (const [formName, { query }] of Object.entries(formTables)) {
      try {
        const [results] = await pool.execute(query, [effectiveTraineeId]);
        formsResult[formName] = results.map((row) => row.id);
      } catch (err) {
        console.error(`Error fetching ${formName}:`, err);
        formsResult[formName] = [];
      }
    }

    res.status(200).json({
      traineeId: effectiveTraineeId,
      Forms: formsResult,
    });
  } catch (err) {
    console.error("Server Error:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching completed forms" });
  }
};

module.exports = { getFormById, getCompletedFormsById };
