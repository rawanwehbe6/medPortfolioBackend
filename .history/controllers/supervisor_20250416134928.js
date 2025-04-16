const pool = require('../config/db'); 

const getUsersBySupervisor = async (req, res) => {
    try {

        const supervisorID=req.user.userId;
        // Validate the input
        if (!supervisorID) {
            return res.status(400).json({
                success: false,
                message: 'Bad request: supervisorID is required'
            });
        }

        // Fetch supervisees from the database
        const [users] = await pool.execute(
            `SELECT 
                u.User_ID, 
                u.Name, 
                u.Email, 
                COALESCE(t.image_path, NULL) AS picture
             FROM supervisor_supervisee ss
             JOIN users u ON ss.SuperviseeID = u.User_ID
             LEFT JOIN trainee_portfolio_images t ON u.User_ID = t.trainee_id
             WHERE ss.SupervisorID = ?`,
            [supervisorID]
        );

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error("Error fetching users by supervisor:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
const getFormCountsByTrainee = async (req, res) => {
  const { traineeId } = req.params;

  const formTypes = [
    { table: "case_based_discussion_assessment", idCol: "resident_id", sentCol: "sent", completeCol: "completed" },
    { table: "grand_round_presentation_assessment", idCol: "resident_id", sentCol: "sent", completeCol: "completed" },
    { table: "mortality_morbidity_review_assessment", idCol: "resident_id", sentCol: "sent", completeCol: "completed" },
    { table: "seminar_assessment", idCol: "resident_id", sentCol: "sent", completeCol: "completed" },
    // { table: "fellow_resident_evaluation", idCol: "fellow_id", sentCol: "is_sent_to_trainee", completeCol: "is_draft", inverseCompleted: true },
    { table: "journal_club_assessment", idCol: "fellow_id", sentCol: "set", completeCol: "complete", inverseCompleted: true },
    { table: "mini_cex", idCol: "trainee_id", sentCol: "sent_to_trainee", completeCol: "is_draft", inverseCompleted: true },
    { table: "dops", idCol: "trainee_id", sentCol: "is_sent_to_trainee", completeCol: "is_draft", inverseCompleted: true }
  ];

  const result = {};

  try {
    for (const form of formTypes) {
      const { table, idCol, sentCol, completeCol, inverseCompleted } = form;

      const sentQuery = `SELECT COUNT(*) as sent FROM ${table} WHERE ${idCol} = ? AND ${sentCol} = 1`;
      const completeQuery = inverseCompleted
        ? `SELECT COUNT(*) as completed FROM ${table} WHERE ${idCol} = ? AND ${completeCol} = 0`
        : `SELECT COUNT(*) as completed FROM ${table} WHERE ${idCol} = ? AND ${completeCol} = 1`;

      const [[{ sent }]] = await pool.execute(sentQuery, [traineeId]);
      const [[{ completed }]] = await pool.execute(completeQuery, [traineeId]);

      result[table] = { sent, completed };
    }

    res.status(200).json({ traineeId, formStatus: result });
  } catch (error) {
    console.error("Error fetching form counts:", error);
    res.status(500).json({ error: "Server error fetching form stats" });
  }
};


module.exports = {
  getUsersBySupervisor,
  getFormCountsByTrainee
};