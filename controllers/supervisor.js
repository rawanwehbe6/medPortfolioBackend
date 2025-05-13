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
const getUserData = async (traineeId) => {
  try {
    // Get all portfolio components for the trainee
    const [
      portfolioImages,
      skills,
      research,
      surgicalExperience,
      accomplishments,
      courses,
      workshops,
      conferences,
    ] = await Promise.all([
      // Get portfolio images
      pool.query(
        "SELECT id, image_path FROM trainee_portfolio_images WHERE trainee_id = ?",
        [traineeId]
      ),

      // Get skills
      pool.query(
        "SELECT Skill_ID, Skill_Name FROM user_skills WHERE User_ID = ?",
        [traineeId]
      ),

      // Get research
      pool.query("SELECT * FROM research WHERE User_ID = ?", [traineeId]),

      // Get surgical experience
      pool.query("SELECT * FROM surgical_experiences WHERE User_ID = ?", [
        traineeId,
      ]),

      // Get accomplishments
      pool.query("SELECT * FROM accomplishments WHERE User_ID = ?", [
        traineeId,
      ]),

      // Get courses
      pool.query("SELECT * FROM eduactcourses WHERE User_ID = ?", [traineeId]),

      // Get workshops
      pool.query("SELECT * FROM eduactworkshops WHERE User_ID = ?", [
        traineeId,
      ]),

      // Get conferences
      pool.query("SELECT * FROM eduactconferences WHERE User_ID = ?", [
        traineeId,
      ]),
    ]);

    // Add full URL to the first portfolio image (to match the second function's format)
    let profilePictureData = [];

    if (portfolioImages[0] && portfolioImages[0].length > 0) {
      profilePictureData = [
        {
          id: portfolioImages[0][0].id,
          image_url: `${process.env.BASE_URL || "http://localhost:3000"}/${
            portfolioImages[0][0].image_path
          }`,
        },
      ];
    }

    // Structure the data for the response
    const userData = {
      profilePicture: profilePictureData[0] || null,
      skills: skills[0], // Keep [0] to maintain current structure
      research: research[0],
      surgicalExperience: surgicalExperience[0],
      accomplishments: accomplishments[0],
      courses: courses[0],
      workshops: workshops[0],
      conferences: conferences[0],
    };

    return {
      status: 200,
      data: userData,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return {
      status: 500,
      error: "An error occurred while fetching user data.",
    };
  }
};

// Controller function to handle HTTP request/response
const handleGetUserData = async (req, res) => {
  const { traineeId } = req.params;
  try {
    const userId = req.user ? req.user.userId : null;

    if (!userId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }
    const authorized = await isSupervisorOfTrainee(userId, traineeId);
    if (!authorized) {
      return res
        .status(403)
        .json({ error: "Forbidden: You are not supervising this trainee" });
    }

    const result = await getUserData(traineeId);

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    res.status(result.status).json(result.data);
  } catch (error) {
    console.error("Error in handleGetUserData:", error);
    res.status(500).json({ message: "Error processing request." });
  }
};

const getUsersBySupervisor = async (req, res) => {
  try {
    const supervisorID = req.user.userId;
    // Validate the input
    if (!supervisorID) {
      return res.status(400).json({
        success: false,
        message: "Bad request: supervisorID is required",
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
      max_forms: users.length * 38,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users by supervisor:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const getFormCountsByTrainee = async (req, res) => {
  const { traineeId } = req.params;

  const formTypes = [
    {
      table: "case_based_discussion_assessment",
      idCol: "resident_id",
      sentCol: "sent",
      completeCol: "completed",
    },
    {
      table: "grand_round_presentation_assessment",
      idCol: "resident_id",
      sentCol: "sent",
      completeCol: "completed",
    },
    {
      table: "mortality_morbidity_review_assessment",
      idCol: "resident_id",
      sentCol: "sent",
      completeCol: "completed",
    },
    {
      table: "seminar_assessment",
      idCol: "resident_id",
      sentCol: "sent",
      completeCol: "completed",
    },
    {
      table: "fellow_resident_evaluation",
      idCol: "resident_id",
      sentCol: "sent",
      completeCol: "completed",
    },
    {
      table: "journal_club_assessment",
      idCol: "resident_id",
      sentCol: "sent",
      completeCol: "complete",
    },
    {
      table: "mini_cex",
      idCol: "resident_id",
      sentCol: "sent_to_trainee",
      completeCol: "is_draft",
      inverseCompleted: true,
    },
    {
      table: "dops",
      idCol: "resident_id",
      sentCol: "is_sent_to_trainee",
      completeCol: "is_draft",
      inverseCompleted: true,
    },
  ];

  const result = {};
  let totalSent = 0;
  let totalCompleted = 0;

  try {
    for (const form of formTypes) {
      const { table, idCol, sentCol, completeCol, inverseCompleted } = form;

      const sentQuery = `SELECT COUNT(*) as sent FROM ${table} WHERE ${idCol} = ? AND ${sentCol} = 1`;
      const completeQuery = inverseCompleted
        ? `SELECT COUNT(*) as completed FROM ${table} WHERE ${idCol} = ? AND ${completeCol} = 0`
        : `SELECT COUNT(*) as completed FROM ${table} WHERE ${idCol} = ? AND ${completeCol} = 1`;

      const [[{ sent }]] = await pool.execute(sentQuery, [traineeId]);
      const [[{ completed }]] = await pool.execute(completeQuery, [traineeId]);

      totalSent += sent;
      totalCompleted += completed;

      result[table] = { sent, completed };
    }

    result.total = {
      totalSent,
      totalCompleted,
    };

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
    return res
      .status(403)
      .json({ error: "Forbidden: You are not supervising this trainee" });
  }

  const formTypes = [
    {
      table: "case_based_discussion_assessment",
      idCol: "resident_id",
      sentCol: "sent",
    },
    {
      table: "grand_round_presentation_assessment",
      idCol: "resident_id",
      sentCol: "sent",
    },
    {
      table: "mortality_morbidity_review_assessment",
      idCol: "resident_id",
      sentCol: "sent",
    },
    { table: "seminar_assessment", idCol: "resident_id", sentCol: "sent" },
    {
      table: "fellow_resident_evaluation",
      idCol: "resident_id",
      sentCol: "sent",
    },
    { table: "journal_club_assessment", idCol: "resident_id", sentCol: "sent" },
    { table: "mini_cex", idCol: "resident_id", sentCol: "sent_to_trainee" },
    { table: "dops", idCol: "resident_id", sentCol: "is_sent_to_trainee" },
  ];

  const result = {};

  try {
    for (const { table, idCol, sentCol } of formTypes) {
      const query = `SELECT id FROM ${table} WHERE ${idCol} = ? AND ${sentCol} = 1`;
      const [rows] = await pool.execute(query, [traineeId]);
      result[table] = rows.map((r) => r.id);
    }

    res.status(200).json({ traineeId, Forms: result });
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
    return res
      .status(403)
      .json({ error: "Forbidden: You are not supervising this trainee" });
  }
  const formTypes = [
    {
      table: "case_based_discussion_assessment",
      idCol: "resident_id",
      completeCol: "completed",
    },
    {
      table: "grand_round_presentation_assessment",
      idCol: "resident_id",
      completeCol: "completed",
    },
    {
      table: "mortality_morbidity_review_assessment",
      idCol: "resident_id",
      completeCol: "completed",
    },
    {
      table: "seminar_assessment",
      idCol: "resident_id",
      completeCol: "completed",
    },
    {
      table: "fellow_resident_evaluation",
      idCol: "resident_id",
      completeCol: "completed",
    },
    {
      table: "journal_club_assessment",
      idCol: "resident_id",
      completeCol: "complete",
    },
    {
      table: "mini_cex",
      idCol: "resident_id",
      completeCol: "is_draft",
      inverse: true,
    },
    {
      table: "dops",
      idCol: "resident_id",
      completeCol: "is_draft",
      inverse: true,
    },
  ];

  const result = {};

  try {
    for (const { table, idCol, completeCol, inverse } of formTypes) {
      const condition = inverse ? `${completeCol} = 0` : `${completeCol} = 1`;
      const query = `SELECT id FROM ${table} WHERE ${idCol} = ? AND ${condition}`;
      const [rows] = await pool.execute(query, [traineeId]);
      result[table] = rows.map((r) => r.id);
    }

    res.status(200).json({ traineeId, Forms: result });
  } catch (err) {
    console.error("Error fetching completed forms:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching completed forms" });
  }
};

const getDraftFormsForTraineeBySupervisor = async (req, res) => {
  const { traineeId } = req.params;
  const supervisorId = req.user.userId;

  if (!traineeId || !supervisorId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const authorized = await isSupervisorOfTrainee(supervisorId, traineeId);
  console.log(authorized, supervisorId, traineeId);
  if (!authorized) {
    return res
      .status(403)
      .json({ error: "Forbidden: You are not supervising this trainee" });
  }

  try {
    const formTypes = [
      {
        table: "mini_cex",
        traineeCol: "resident_id",
        supervisorCol: "supervisor_id",
        draftCol: "sent_to_trainee",
      },
      {
        table: "dops",
        traineeCol: "resident_id",
        supervisorCol: "supervisor_id",
        draftCol: "is_sent_to_trainee",
      },
      {
        table: "journal_club_assessment",
        traineeCol: "resident_id",
        supervisorCol: "supervisor_id",
        draftCol: "sent",
      },
      {
        table: "case_based_discussion_assessment",
        traineeCol: "resident_id",
        supervisorCol: "supervisor_id",
        draftCol: "sent",
      },
      {
        table: "seminar_assessment",
        traineeCol: "resident_id",
        supervisorCol: "supervisor_id",
        draftCol: "sent",
      },
      {
        table: "grand_round_presentation_assessment",
        traineeCol: "resident_id",
        supervisorCol: "supervisor_id",
        draftCol: "sent",
      },
      {
        table: "mortality_morbidity_review_assessment",
        traineeCol: "resident_id",
        supervisorCol: "supervisor_id",
        draftCol: "sent",
      },
      {
        table: "fellow_resident_evaluation",
        traineeCol: "resident_id",
        supervisorCol: "supervisor_id",
        draftCol: "sent",
      },
    ];

    const result = {};
    const counts = {};

    for (const {
      table,
      traineeCol,
      supervisorCol,
      draftCol,
      value,
    } of formTypes) {
      const query = `
        SELECT id FROM ${table}
        WHERE ${traineeCol} = ? AND ${supervisorCol} = ? AND ${draftCol} = ?
      `;
      const [rows] = await pool.execute(query, [traineeId, supervisorId, 0]);
      result[table] = rows.map((r) => r.id);
      counts[table] = rows.length;
    }

    res.status(200).json({ 
      traineeId, 
      supervisorId, 
      Forms: result,
      counts
    });
  } catch (err) {
    console.error("Error fetching draft forms for trainee by supervisor:", err);
    res.status(500).json({ error: "Server error while fetching drafts" });
  }
};
const getFormCountsBySupervisor = async (req, res) => {
  const supervisorID = req.user.userId;

  if (!supervisorID) {
    return res.status(400).json({
      success: false,
      message: "Bad request: supervisorID is required",
    });
  }

  const formTypes = [
    {
      table: "case_based_discussion_assessment",
      idCol: "resident_id",
      sentCol: "sent",
      completeCol: "completed",
    },
    {
      table: "grand_round_presentation_assessment",
      idCol: "resident_id",
      sentCol: "sent",
      completeCol: "completed",
    },
    {
      table: "mortality_morbidity_review_assessment",
      idCol: "resident_id",
      sentCol: "sent",
      completeCol: "completed",
    },
    {
      table: "seminar_assessment",
      idCol: "resident_id",
      sentCol: "sent",
      completeCol: "completed",
    },
    {
      table: "fellow_resident_evaluation",
      idCol: "resident_id",
      sentCol: "sent",
      completeCol: "completed",
    },
    {
      table: "journal_club_assessment",
      idCol: "resident_id",
      sentCol: "sent",
      completeCol: "complete",
    },
    {
      table: "mini_cex",
      idCol: "resident_id",
      sentCol: "sent_to_trainee",
      completeCol: "is_draft",
      inverseCompleted: true,
    },
    {
      table: "dops",
      idCol: "resident_id",
      sentCol: "is_sent_to_trainee",
      completeCol: "is_draft",
      inverseCompleted: true,
    },
  ];

  try {
    const [trainees] = await pool.execute(
      `SELECT u.User_ID, u.Name
       FROM supervisor_supervisee ss
       JOIN users u ON ss.SuperviseeID = u.User_ID
       WHERE ss.SupervisorID = ?`,
      [supervisorID]
    );

    const traineeTotals = [];
    let overallTotalSent = 0;
    let overallTotalCompleted = 0;

    for (const trainee of trainees) {
      const traineeId = trainee.User_ID;
      let totalSent = 0;
      let totalCompleted = 0;

      for (const form of formTypes) {
        const { table, idCol, sentCol, completeCol, inverseCompleted } = form;

        const sentQuery = `SELECT COUNT(*) as sent FROM ${table} WHERE ${idCol} = ? AND ${sentCol} = 1`;
        const completeQuery = inverseCompleted
          ? `SELECT COUNT(*) as completed FROM ${table} WHERE ${idCol} = ? AND ${completeCol} = 0`
          : `SELECT COUNT(*) as completed FROM ${table} WHERE ${idCol} = ? AND ${completeCol} = 1`;

        const [[{ sent }]] = await pool.execute(sentQuery, [traineeId]);
        const [[{ completed }]] = await pool.execute(completeQuery, [
          traineeId,
        ]);

        totalSent += sent;
        totalCompleted += completed;
      }

      overallTotalSent += totalSent;
      overallTotalCompleted += totalCompleted;

      traineeTotals.push({
        traineeId,
        name: trainee.Name,
        totalSent,
        totalCompleted,
      });
    }

    res.status(200).json({
      supervisorId: supervisorID,
      overallTotal: {
        sent: overallTotalSent,
        completed: overallTotalCompleted,
      },
      trainees: traineeTotals,
    });
  } catch (error) {
    console.error("Error fetching form counts by supervisor:", error);
    res
      .status(500)
      .json({ error: "Server error fetching form counts by supervisor" });
  }
};

const getAllSuperviseesSentForms = async (req, res) => {
  const supervisorId = req.user.userId;

  if (!supervisorId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get all supervisees for this supervisor
    const [supervisees] = await pool.execute(
      `SELECT SuperviseeID FROM supervisor_supervisee WHERE SupervisorID = ?`,
      [supervisorId]
    );

    if (supervisees.length === 0) {
      return res.status(200).json({
        supervisorId,
        supervisees: [],
        message: "No supervisees found for this supervisor",
      });
    }

    const superviseeIds = supervisees.map((s) => s.SuperviseeID);

    const formTypes = [
      {
        table: "case_based_discussion_assessment",
        sentCol: "sent",
      },
      {
        table: "grand_round_presentation_assessment",
        sentCol: "sent",
      },
      {
        table: "mortality_morbidity_review_assessment",
        sentCol: "sent",
      },
      { table: "seminar_assessment", sentCol: "sent" },
      {
        table: "fellow_resident_evaluation",
        sentCol: "sent",
      },
      {
        table: "journal_club_assessment",
        sentCol: "sent",
      },
      { table: "mini_cex", sentCol: "sent_to_trainee" },
      { table: "dops", sentCol: "is_sent_to_trainee" },
    ];

    const result = {};

    // For each supervisee, get their forms
    for (const traineeId of superviseeIds) {
      const traineeResults = {};

      for (const { table, idCol, sentCol } of formTypes) {
        const query = `SELECT id FROM ${table} WHERE resident_id = ? AND ${sentCol} = 1`;
        const [rows] = await pool.execute(query, [traineeId]);
        traineeResults[table] = rows.map((r) => r.id);
      }

      // Get trainee name for better context
      const [traineeInfo] = await pool.execute(
        `SELECT Name FROM users WHERE User_ID = ?`,
        [traineeId]
      );

      const traineeName =
        traineeInfo.length > 0 ? traineeInfo[0].Name : "Unknown";

      result[traineeId] = {
        traineeName,
        forms: traineeResults,
      };
    }

    res.status(200).json({
      supervisorId,
      superviseesSentForms: result,
    });
  } catch (err) {
    console.error("Error fetching all supervisees sent forms:", err);
    res.status(500).json({ error: "Server error while fetching sent forms" });
  }
};

const getAllSuperviseesCompletedForms = async (req, res) => {
  const supervisorId = req.user.userId;

  if (!supervisorId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get all supervisees for this supervisor
    const [supervisees] = await pool.execute(
      `SELECT SuperviseeID FROM supervisor_supervisee WHERE SupervisorID = ?`,
      [supervisorId]
    );

    if (supervisees.length === 0) {
      return res.status(200).json({
        supervisorId,
        supervisees: [],
        message: "No supervisees found for this supervisor",
      });
    }

    const superviseeIds = supervisees.map((s) => s.SuperviseeID);

    const formTypes = [
      {
        table: "case_based_discussion_assessment",
        completeCol: "completed",
      },
      {
        table: "grand_round_presentation_assessment",
        completeCol: "completed",
      },
      {
        table: "mortality_morbidity_review_assessment",
        completeCol: "completed",
      },
      {
        table: "seminar_assessment",
        completeCol: "completed",
      },
      {
        table: "fellow_resident_evaluation",
        completeCol: "completed",
      },
      {
        table: "journal_club_assessment",
        completeCol: "complete",
      },
      {
        table: "mini_cex",
        completeCol: "is_draft",
        inverse: true,
      },
      {
        table: "dops",
        completeCol: "is_draft",
        inverse: true,
      },
    ];

    const result = {};

    // For each supervisee, get their forms
    for (const traineeId of superviseeIds) {
      const traineeResults = {};

      for (const { table, idCol, completeCol, inverse } of formTypes) {
        const condition = inverse ? `${completeCol} = 0` : `${completeCol} = 1`;
        const query = `SELECT id FROM ${table} WHERE resident_id = ? AND ${condition}`;
        const [rows] = await pool.execute(query, [traineeId]);
        traineeResults[table] = rows.map((r) => r.id);
      }

      // Get trainee name for better context
      const [traineeInfo] = await pool.execute(
        `SELECT Name FROM users WHERE User_ID = ?`,
        [traineeId]
      );

      const traineeName =
        traineeInfo.length > 0 ? traineeInfo[0].Name : "Unknown";

      result[traineeId] = {
        traineeName,
        forms: traineeResults,
      };
    }

    res.status(200).json({
      supervisorId,
      superviseesCompletedForms: result,
    });
  } catch (err) {
    console.error("Error fetching all supervisees completed forms:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching completed forms" });
  }
};

module.exports = {
  getUsersBySupervisor,
  getFormCountsByTrainee,
  getSentFormIdsForTrainee,
  getCompletedFormIdsForTrainee,
  getDraftFormsForTraineeBySupervisor,
  getFormCountsBySupervisor,
  handleGetUserData,
  getAllSuperviseesSentForms,
  getAllSuperviseesCompletedForms,
};