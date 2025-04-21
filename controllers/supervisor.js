const pool = require('../config/db'); 

const isSupervisorOfTrainee = async (supervisorId, traineeId) => {
  const query = `
    SELECT 1 FROM supervisor_supervisee 
    WHERE SupervisorID = ? AND SuperviseeID = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [supervisorId, traineeId]);
  return rows.length > 0;
};

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
    { table: "fellow_resident_evaluation", idCol: "fellow_id", sentCol: "sent", completeCol: "completed" },
    { table: "journal_club_assessment", idCol: "resident_id", sentCol: "sent", completeCol: "complete"},
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

const getSentFormIdsForTrainee = async (req, res) => {
   const { traineeId } = req.params;
  const supervisorId = req.user.userId;

  if (!traineeId || !supervisorId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const authorized = await isSupervisorOfTrainee(supervisorId, traineeId);
  if (!authorized) {
    return res.status(403).json({ error: "Forbidden: You are not supervising this trainee" });
  }

  const formTypes = [
    { table: "case_based_discussion_assessment", idCol: "resident_id", sentCol: "sent" },
    { table: "grand_round_presentation_assessment", idCol: "resident_id", sentCol: "sent" },
    { table: "mortality_morbidity_review_assessment", idCol: "resident_id", sentCol: "sent" },
    { table: "seminar_assessment", idCol: "resident_id", sentCol: "sent" },
    { table: "fellow_resident_evaluation", idCol: "fellow_id", sentCol: "sent" },
    { table: "journal_club_assessment", idCol: "resident_id", sentCol: "sent" },
    { table: "mini_cex", idCol: "trainee_id", sentCol: "sent_to_trainee" },
    { table: "dops", idCol: "trainee_id", sentCol: "is_sent_to_trainee" }
  ];

  const result = {};

  try {
    for (const { table, idCol, sentCol } of formTypes) {
      const query = `SELECT id FROM ${table} WHERE ${idCol} = ? AND ${sentCol} = 1`;
      const [rows] = await pool.execute(query, [traineeId]);
      result[table] = rows.map(r => r.id);
    }

    res.status(200).json({ traineeId, sentForms: result });
  } catch (err) {
    console.error("Error fetching sent forms:", err);
    res.status(500).json({ error: "Server error while fetching sent forms" });
  }
};


const getCompletedFormIdsForTrainee = async (req, res) => {
   const { traineeId } = req.params;
  const supervisorId = req.user.userId;

  if (!traineeId || !supervisorId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const authorized = await isSupervisorOfTrainee(supervisorId, traineeId);
  if (!authorized) {
    return res.status(403).json({ error: "Forbidden: You are not supervising this trainee" });
  }
  const formTypes = [
    { table: "case_based_discussion_assessment", idCol: "resident_id", completeCol: "completed" },
    { table: "grand_round_presentation_assessment", idCol: "resident_id", completeCol: "completed" },
    { table: "mortality_morbidity_review_assessment", idCol: "resident_id", completeCol: "completed" },
    { table: "seminar_assessment", idCol: "resident_id", completeCol: "completed" },
    { table: "fellow_resident_evaluation", idCol: "fellow_id", completeCol: "completed" },
    { table: "journal_club_assessment", idCol: "resident_id", completeCol: "complete" },
    { table: "mini_cex", idCol: "trainee_id", completeCol: "is_draft", inverse: true },
    { table: "dops", idCol: "trainee_id", completeCol: "is_draft", inverse: true }
  ];

  const result = {};

  try {
    for (const { table, idCol, completeCol, inverse } of formTypes) {
      const condition = inverse ? `${completeCol} = 0` : `${completeCol} = 1`;
      const query = `SELECT id FROM ${table} WHERE ${idCol} = ? AND ${condition}`;
      const [rows] = await pool.execute(query, [traineeId]);
      result[table] = rows.map(r => r.id);
    }

    res.status(200).json({ traineeId, completedForms: result });
  } catch (err) {
    console.error("Error fetching completed forms:", err);
    res.status(500).json({ error: "Server error while fetching completed forms" });
  }
};

const getDraftFormsForTraineeBySupervisor = async (req, res) => {
  const { traineeId } = req.params;
  const supervisorId = req.user.userId;

  if (!traineeId || !supervisorId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const authorized = await isSupervisorOfTrainee(supervisorId, traineeId);
  if (!authorized) {
    return res.status(403).json({ error: "Forbidden: You are not supervising this trainee" });
  }

  try {
    const formTypes = [
      { table: "mini_cex", traineeCol: "trainee_id", supervisorCol: "supervisor_id", draftCol: "is_draft", value: 1 },
      { table: "dops", traineeCol: "trainee_id", supervisorCol: "supervisor_id", draftCol: "is_draft", value: 1 },
      { table: "journal_club_assessment", traineeCol: "resident_id", supervisorCol: "supervisor_id", draftCol: "sent", value: 0 },
      { table: "case_based_discussion_assessment", traineeCol: "resident_id", supervisorCol: "supervisor_id", draftCol: "sent", value: 0 },
      { table: "seminar_assessment", traineeCol: "resident_id", supervisorCol: "supervisor_id", draftCol: "sent", value: 0 },
      { table: "grand_round_presentation_assessment", traineeCol: "resident_id", supervisorCol: "supervisor_id", draftCol: "sent", value: 0 },
      { table: "mortality_morbidity_review_assessment", traineeCol: "resident_id", supervisorCol: "supervisor_id", draftCol: "sent", value: 0 },
      { table: "fellow_resident_evaluation", traineeCol: "fellow_id", supervisorCol: "supervisor_id", draftCol: "sent", value: 0 }
    ];

    const result = {};

    for (const { table, traineeCol, supervisorCol, draftCol, value } of formTypes) {
      const query = `
        SELECT id FROM ${table}
        WHERE ${traineeCol} = ? AND ${supervisorCol} = ? AND ${draftCol} = ?
      `;
      const [rows] = await pool.execute(query, [traineeId, supervisorId, value]);
      result[table] = rows.map(r => r.id);
    }

    res.status(200).json({ traineeId, supervisorId, draftForms: result });
  } catch (err) {
    console.error("Error fetching draft forms for trainee by supervisor:", err);
    res.status(500).json({ error: "Server error while fetching drafts" });
  }
};



module.exports = {
  getUsersBySupervisor,
  getFormCountsByTrainee,
  getSentFormIdsForTrainee,
  getCompletedFormIdsForTrainee,
  getDraftFormsForTraineeBySupervisor
};