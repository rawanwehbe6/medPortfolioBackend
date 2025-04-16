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
    { name: "Journal Club", table: "journal_club_assessment", idCol: "fellow_id", sentCol: "sent", completeCol: "complete", required: 4 },
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

module.exports = {
  getFormsProgressForTrainee
};
