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
const getUserData = async (userId) => {
  try {
    if (!userId) {
      return {
        error: "Unauthorized access: User ID is required.",
        status: 403,
      };
    }

    // Get courses
    const [courses] = await pool.query(
      `
      SELECT 
        id, title, 
        DATE_FORMAT(date, '%m/%d/%Y') AS date, 
        institution, description, certificate
      FROM eduactcourses
      WHERE user_id = ?
      ORDER BY date DESC
    `,
      [userId]
    );

    const coursesWithUrl = courses.map((course) => ({
      ...course,
      certificate_url: course.certificate
        ? `${process.env.BASE_URL}/${course.certificate}`
        : null,
    }));

    // Get workshops
    const [workshops] = await pool.query(
      `
      SELECT 
        id, title, 
        DATE_FORMAT(date, '%m/%d/%Y') AS date, 
        organizer, description, certificate 
      FROM eduactworkshops 
      WHERE user_id = ? 
      ORDER BY date DESC
    `,
      [userId]
    );

    const workshopsWithUrl = workshops.map((workshop) => ({
      ...workshop,
      certificate_url: workshop.certificate
        ? `${process.env.BASE_URL}/${workshop.certificate}`
        : null,
    }));

    // Get conferences
    const [conferences] = await pool.query(
      `
      SELECT 
        id, title, 
        DATE_FORMAT(date, '%m/%d/%Y') AS date, 
        host, description, certificate
      FROM eduactconferences
      WHERE User_ID = ?
      ORDER BY date DESC
    `,
      [userId]
    );

    const conferencesWithUrl = conferences.map((conference) => ({
      ...conference,
      certificate_url: conference.certificate
        ? `${process.env.BASE_URL}/${conference.certificate}`
        : null,
    }));

    // Get accomplishments
    const [accomplishments] = await pool.query(
      `
      SELECT * FROM accomplishments
      WHERE User_ID = ?
      ORDER BY id DESC
    `,
      [userId]
    );

    const accomplishmentsWithUrl = accomplishments.map((item) => ({
      ...item,
      file_path_url: item.file_path
        ? `${process.env.BASE_URL}/${item.file_path}`
        : null,
    }));

    // Get surgical experiences
    const [surgicalExperiences] = await pool.query(
      `
      SELECT 
        Experience_ID, User_ID, Procedure_Name, 
        DATE_FORMAT(Date, '%m/%d/%Y') AS Date, 
        Role, Clinic, Description, created_at, updated_at 
      FROM surgical_experiences
      WHERE User_ID = ?
      ORDER BY Date DESC
    `,
      [userId]
    );

    // Get research papers
    const [research] = await pool.query(
      `
      SELECT 
        Research_ID, Title,
        DATE_FORMAT(Date, '%m/%d/%Y') AS Date,
        Description, File_Path
      FROM research
      WHERE User_ID = ?
      ORDER BY Date DESC
    `,
      [userId]
    );

    const researchWithUrl = research.map((item) => ({
      ...item,
      image_url: item.File_Path
        ? `${process.env.BASE_URL}/${item.File_Path}`
        : null,
    }));

    // Get skills
    const [skills] = await pool.query(
      `
      SELECT Skill_ID, Skill_Name 
      FROM user_skills 
      WHERE User_ID = ?
    `,
      [userId]
    );

    // Return all data as a structured object
    return {
      status: 200,
      data: {
        courses: coursesWithUrl,
        workshops: workshopsWithUrl,
        conferences: conferencesWithUrl,
        accomplishments: accomplishmentsWithUrl,
        surgicalExperiences,
        research: researchWithUrl,
        skills,
      },
    };
  } catch (error) {
    console.error("Error in getUserData:", error);
    return {
      status: 500,
      error: "Error fetching user data.",
      details: error.message,
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
      idCol: "fellow_id",
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
      idCol: "trainee_id",
      sentCol: "sent_to_trainee",
      completeCol: "is_draft",
      inverseCompleted: true,
    },
    {
      table: "dops",
      idCol: "trainee_id",
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
      idCol: "fellow_id",
      sentCol: "sent",
    },
    { table: "journal_club_assessment", idCol: "resident_id", sentCol: "sent" },
    { table: "mini_cex", idCol: "trainee_id", sentCol: "sent_to_trainee" },
    { table: "dops", idCol: "trainee_id", sentCol: "is_sent_to_trainee" },
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
      idCol: "fellow_id",
      completeCol: "completed",
    },
    {
      table: "journal_club_assessment",
      idCol: "resident_id",
      completeCol: "complete",
    },
    {
      table: "mini_cex",
      idCol: "trainee_id",
      completeCol: "is_draft",
      inverse: true,
    },
    {
      table: "dops",
      idCol: "trainee_id",
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
        traineeCol: "trainee_id",
        supervisorCol: "supervisor_id",
        draftCol: "is_draft",
        value: 1,
      },
      {
        table: "dops",
        traineeCol: "trainee_id",
        supervisorCol: "supervisor_id",
        draftCol: "is_draft",
        value: 1,
      },
      {
        table: "journal_club_assessment",
        traineeCol: "resident_id",
        supervisorCol: "supervisor_id",
        draftCol: "sent",
        value: 0,
      },
      {
        table: "case_based_discussion_assessment",
        traineeCol: "resident_id",
        supervisorCol: "supervisor_id",
        draftCol: "sent",
        value: 0,
      },
      {
        table: "seminar_assessment",
        traineeCol: "resident_id",
        supervisorCol: "supervisor_id",
        draftCol: "sent",
        value: 0,
      },
      {
        table: "grand_round_presentation_assessment",
        traineeCol: "resident_id",
        supervisorCol: "supervisor_id",
        draftCol: "sent",
        value: 0,
      },
      {
        table: "mortality_morbidity_review_assessment",
        traineeCol: "resident_id",
        supervisorCol: "supervisor_id",
        draftCol: "sent",
        value: 0,
      },
      {
        table: "fellow_resident_evaluation",
        traineeCol: "fellow_id",
        supervisorCol: "supervisor_id",
        draftCol: "sent",
        value: 0,
      },
    ];

    const result = {};

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
      const [rows] = await pool.execute(query, [
        traineeId,
        supervisorId,
        value,
      ]);
      result[table] = rows.map((r) => r.id);
    }

    res.status(200).json({ traineeId, supervisorId, Forms: result });
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
      idCol: "fellow_id",
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
      idCol: "trainee_id",
      sentCol: "sent_to_trainee",
      completeCol: "is_draft",
      inverseCompleted: true,
    },
    {
      table: "dops",
      idCol: "trainee_id",
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

module.exports = {
  getUsersBySupervisor,
  getFormCountsByTrainee,
  getSentFormIdsForTrainee,
  getCompletedFormIdsForTrainee,
  getDraftFormsForTraineeBySupervisor,
  getFormCountsBySupervisor,
  handleGetUserData,
};