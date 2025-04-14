const pool = require('../config/db');

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
    // { table: "fellow_resident_evaluation", idCol: "fellow_id", sentCol: "is_sent_to_trainee", completeCol: "is_draft", inverseCompleted: true },
    // { table: "journal_club_assessment", idCol: "fellow_id", sentCol: "is_sent_to_trainee", completeCol: "is_draft", inverseCompleted: true },
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

module.exports = {
  getSentFormsForTrainee
};
