const pool = require('../config/db');

const getFormsProgressForTrainee = async (req, res) => {
  const traineeId = req.user.userId;
  if (!traineeId) {
    return res.status(401).json({ error: "Unauthorized: trainee ID not found in token" });
  }

  const formTypes = [
    { name: "Case Based Discussion", table: "case_based_discussion_assessment", idCol: "resident_id", sentCol: "sent", completeCol: "completed", required: 1 },
    { name: "Grand Round Presentation", table: "grand_round_presentation_assessment", idCol: "resident_id", sentCol: "sent", completeCol: "completed", required: 1 },
    { name: "Mortality Morbidity Review", table: "mortality_morbidity_review_assessment", idCol: "resident_id", sentCol: "sent", completeCol: "completed", required: 4 },
    { name: "Seminar Assessment", table: "seminar_assessment", idCol: "resident_id", sentCol: "sent", completeCol: "completed", required: 5 },
    { name: "Mini CEX", table: "mini_cex", idCol: "trainee_id", sentCol: "sent_to_trainee", completeCol: "is_signed_by_trainee", required: 1 },
    { name: "DOPS", table: "dops", idCol: "trainee_id", sentCol: "is_sent_to_trainee", completeCol: "is_signed_by_trainee", required: 1 },
    { name: "Journal Club", table: "journal_club_assessment", idCol: "resident_id", sentCol: "sent", completeCol: "complete", required: 4 },
    { name: "Performance", table: "fellow_resident_evaluation", idCol: "fellow_id", sentCol: "sent", completeCol: "completed", required: 1 }
  ];

  try {
    let totalSent = 0;
    let totalCompleted = 0;
    let totalRequired = 0;
    const formDetails = [];

    for (const form of formTypes) {
      const sentQuery = `SELECT COUNT(*) as count FROM ${form.table} WHERE ${form.idCol} = ? AND ${form.sentCol} = 1`;
      const [sentResult] = await pool.execute(sentQuery, [traineeId]);
      const sentCount = sentResult[0].count;

      const completeQuery = `SELECT COUNT(*) as count FROM ${form.table} WHERE ${form.idCol} = ? AND ${form.completeCol} = 1 AND ${form.sentCol} = 1`;
      const [completeResult] = await pool.execute(completeQuery, [traineeId]);
      const completeCount = completeResult[0].count;

      totalSent += sentCount;
      totalCompleted += completeCount;
      totalRequired += form.required;

      const completionRate = sentCount > 0 ? Math.round((completeCount / sentCount) * 100) : 0;

      formDetails.push({
        formName: form.name,
        sent: sentCount,
        completed: completeCount,
        completionRate
      });
    }

    const sentRate = totalRequired > 0 ? Math.round((totalSent / totalRequired) * 100) : 0;
    const overallCompletionRate = totalSent > 0 ? Math.round((totalCompleted / totalSent) * 100) : 0;

    res.status(200).json({
      traineeId,
      totalForms: {
        sent: totalSent,
        completed: totalCompleted,
        completionRate: overallCompletionRate,
        sentRate: sentRate
      },
      forms: formDetails
    });
  } catch (error) {
    console.error("Error fetching form progress:", error);
    res.status(500).json({ error: "Server error while fetching form progress" });
  }
};

const getSentFormsForTrainee = async (req, res) => {
   const traineeId = req.user.userId;
   if (!traineeId) {
     return res.status(401).json({ error: "Unauthorized: trainee ID not found in token" });
   }
 
   const formTypes = [
    { table: "case_based_discussion_assessment", idCol: "resident_id", sentCol: "sent", completeCol: "completed" },
    { table: "grand_round_presentation_assessment", idCol: "resident_id", sentCol: "sent", completeCol: "completed" },
    { table: "mortality_morbidity_review_assessment", idCol: "resident_id", sentCol: "sent", completeCol: "completed" },
    { table: "seminar_assessment", idCol: "resident_id", sentCol: "sent", completeCol: "completed" },
    { table: "fellow_resident_evaluation", idCol: "fellow_id", sentCol: "sent", completeCol: "completed" },
    { table: "journal_club_assessment", idCol: "resident_id", sentCol: "sent", completeCol: "complete"},
    { table: "mini_cex", idCol: "trainee_id", sentCol: "sent_to_trainee", completeCol: "is_draft", inverseCompleted: true },
    { table: "dops", idCol: "trainee_id", sentCol: "is_sent_to_trainee", completeCol: "is_draft", inverseCompleted: true }
  ];
 
   const result = {};
 
   try {
     for (const { table, idCol, sentCol, completeCol, inverseCompleted } of formTypes) {
       // Query to get all sent forms
       const sentQuery = `SELECT id FROM ${table} WHERE ${idCol} = ? AND ${sentCol} = 1`;
       const [sentRows] = await pool.execute(sentQuery, [traineeId]);
 
       // Query to get completed forms
       const completeCondition = inverseCompleted ? `${completeCol} = 0` : `${completeCol} = 1`;
       const completeQuery = `SELECT id FROM ${table} WHERE ${idCol} = ? AND ${completeCondition}`;
       const [completeRows] = await pool.execute(completeQuery, [traineeId]);
 
       const completedIds = new Set(completeRows.map(row => row.id));
 
       result[table] = sentRows.map(row => ({
         id: row.id,
         status: completedIds.has(row.id) ? 'completed' : 'sent'
       }));
     }
 
     res.status(200).json({ traineeId, sentForms: result });
   } catch (error) {
     console.error("Error fetching sent forms:", error);
     res.status(500).json({ error: "Server error while fetching sent forms" });
   }
 };

const getLatestUpdatedForm = async (req, res) => {
  const traineeId = req.user.userId;
  if (!traineeId) {
    return res.status(401).json({ error: "Unauthorized: trainee ID not found in token" });
  }

  // Array of all form queries with their respective names and ID columns
  const formQueries = [
    {
      name: "Mini CEX",
      query: `SELECT 'Mini CEX' as form_name, updated_at FROM mini_cex WHERE trainee_id = ? ORDER BY updated_at DESC LIMIT 1`
    },
    {
      name: "Case Based Discussion",
      query: `SELECT 'Case Based Discussion' as form_name, updated_at FROM case_based_discussion_assessment WHERE resident_id = ? ORDER BY updated_at DESC LIMIT 1`
    },
    {
      name: "Direct Observation of Procedural Skills",
      query: `SELECT 'DOPS' as form_name, updated_at FROM dops WHERE trainee_id = ? ORDER BY updated_at DESC LIMIT 1`
    },
    {
      name: "Fellow Resident Evaluation",
      query: `SELECT 'Fellow Resident Evaluation' as form_name, updated_at FROM fellow_resident_evaluation WHERE fellow_id = ? ORDER BY updated_at DESC LIMIT 1`
    },
    {
      name: "Grand Round Presentation",
      query: `SELECT 'Grand Round Presentation' as form_name, updated_at FROM grand_round_presentation_assessment WHERE resident_id = ? ORDER BY updated_at DESC LIMIT 1`
    },
    {
      name: "Mortality Morbidity Review",
      query: `SELECT 'Mortality Morbidity Review' as form_name, updated_at FROM mortality_morbidity_review_assessment WHERE resident_id = ? ORDER BY updated_at DESC LIMIT 1`
    },
    {
      name: "Seminar Assessment",
      query: `SELECT 'Seminar Assessment' as form_name, updated_at FROM seminar_assessment WHERE resident_id = ? ORDER BY updated_at DESC LIMIT 1`
    },
    {
      name: "Journal Club",
      query: `SELECT 'Journal Club' as form_name, updated_at FROM journal_club_assessment WHERE resident_id = ? ORDER BY updated_at DESC LIMIT 1`
    }
  ];

  try {
    let latestForm = null;
    
    // Execute all queries and find the most recent form
    for (const form of formQueries) {
      const [rows] = await pool.execute(form.query, [traineeId]);
      if (rows.length > 0) {
        const currentForm = {
          formName: form.name,
          updatedAt: rows[0].updated_at
        };

        // If we don't have a latest form yet or this one is newer
        if (!latestForm || new Date(currentForm.updatedAt) > new Date(latestForm.updatedAt)) {
          latestForm = currentForm;
        }
      }
    }

    if (!latestForm) {
      return res.status(200).json({ 
        message: "No forms found for this trainee"
      });
    }

    res.status(200).json({
      latestForm
    });
  } catch (error) {
    console.error("Error fetching latest updated form:", error);
    res.status(500).json({ error: "Server error while fetching latest updated form" });
  }
};

module.exports = {
  getFormsProgressForTrainee,
  getLatestUpdatedForm,
  getSentFormsForTrainee
};

