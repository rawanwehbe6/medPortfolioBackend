const pool = require('../config/db'); // Database connection
const formatFunctionName = (name) => {
  return name
    .replace(/_/g, ' ')                      // Replace underscores with space
    .replace(/([a-z])([A-Z])/g, '$1 $2')     // Insert space before capital letters
    .replace(/\s+/g, ' ')                    // Normalize multiple spaces
    .trim();
};

const addSupervisorSuperviseeRelation = async (req, res) => {
    try {
        const { supervisorId, superviseeId } = req.body;
        if (!supervisorId || !superviseeId) {
            return res.status(400).json({ message: "Both supervisorId and superviseeId are required." });
        }

        // Check supervisor and supervisee roles
        const [supervisor] = await pool.execute(
            "SELECT role FROM users WHERE User_ID = ?", [supervisorId]
        );
        const [supervisee] = await pool.execute(
            "SELECT role FROM users WHERE User_ID = ?", [superviseeId]
        );

        if (supervisor.length === 0 || supervisee.length === 0) {
            return res.status(404).json({ message: "Supervisor or supervisee not found." });
        }
        // Insert into supervisor-supervisee table
        await pool.execute(
            "INSERT INTO supervisor_supervisee (SupervisorID, SuperviseeID) VALUES (?, ?)",
            [supervisorId, superviseeId]
        );

        res.status(201).json({ message: "Supervisor-supervisee relationship added successfully." });

    } catch (error) {
        console.error("Error adding supervisor-supervisee relationship:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update Supervisor-Supervisee Relationship
const updateSupervisorSuperviseeRelation = async (req, res) => {
  try {
    const { superviseeId, newSupervisorId } = req.body;
    if (!superviseeId || !newSupervisorId) {
      return res.status(400).json({
        message: "Both superviseeId and newSupervisorId are required.",
      });
    }

    // Check if supervisee exists
    const [supervisee] = await pool.execute(
      "SELECT * FROM supervisor_supervisee WHERE SuperviseeID = ?",
      [superviseeId]
    );

    if (supervisee.length === 0) {
      return res
        .status(404)
        .json({ message: "Supervisee does not have an assigned supervisor." });
    }

    // Check if new supervisor exists and has role 3
    const [supervisor] = await pool.execute(
      "SELECT role FROM users WHERE User_ID = ?",
      [newSupervisorId]
    );

    if (supervisor.length === 0) {
      return res.status(404).json({ message: "Supervisor not found." });
    }

    const [usertype] = await pool.execute(
      "SELECT Type FROM usertypes WHERE Id = ?",
      [supervisor[0].role]
    );

    if (usertype.length === 0 || usertype[0].Type !== "Supervisor") {
      return res.status(403).json({ message: "User is not a supervisor." });
    }

    // Delete the old relationship
    await pool.execute(
      "DELETE FROM supervisor_supervisee WHERE SuperviseeID = ?",
      [superviseeId]
    );

    // Insert the new relationship
    await pool.execute(
      "INSERT INTO supervisor_supervisee (SupervisorID, SuperviseeID) VALUES (?, ?)",
      [newSupervisorId, superviseeId]
    );

    res.status(200).json({ message: "Supervisor updated successfully." });
  } catch (error) {
    console.error("Error updating supervisor-supervisee relationship:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete Supervisor-Supervisee Relationship
const deleteSupervisorSuperviseeRelation = async (req, res) => {
  try {
    const { supervisorId, superviseeId } = req.body;
    if (!supervisorId || !superviseeId) {
      return res
        .status(400)
        .json({ message: "Both supervisorId and superviseeId are required." });
    }

    // Check if the relationship exists
    const [existingRelation] = await pool.execute(
      "SELECT * FROM supervisor_supervisee WHERE SupervisorID = ? AND SuperviseeID = ?",
      [supervisorId, superviseeId]
    );

    if (existingRelation.length === 0) {
      return res
        .status(200)
        .json({ message: "Supervisor-supervisee relationship not found." });
    }

    // Delete the relationship
    await pool.execute(
      "DELETE FROM supervisor_supervisee WHERE SupervisorID = ? AND SuperviseeID = ?",
      [supervisorId, superviseeId]
    );

    res
      .status(200)
      .json({
        message: "Supervisor-supervisee relationship deleted successfully.",
      });
  } catch (error) {
    console.error("Error deleting supervisor-supervisee relationship:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//get all contact messages
const getAllContactMessages = async (req, res) => {
  try {
    // Verify the user is admin (role 1)
    // Query the database for all contact messages
    const [messages] = await pool.execute(
      "SELECT id, name, message, created_at FROM contact_messages WHERE is_visible = 1 ORDER BY created_at DESC"
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getUserCountsByRole = async (req, res) => {
  try {
    // Fetch count of users by Type and Name
    const [rows] = await pool.execute(`
      SELECT utypes.Type AS role_type, utypes.Name AS subrole_name, COUNT(*) AS count
      FROM users u
      JOIN usertypes utypes ON u.Role = utypes.Id
      GROUP BY utypes.Type, utypes.Name
    `);

    // Initialize structure
    const counts = {
      total_users: 0,
      trainee: { total: 0, subroles: {} },
      supervisor: { total: 0, subroles: {} },
      admin: { total: 0, subroles: {} },
    };

    // Temporary map to collect subrole entries before sorting
    const tempSubroles = {
      trainee: [],
      supervisor: [],
      admin: [],
    };

    // Populate totals and store subrole entries
    for (const row of rows) {
      const type = row.role_type.toLowerCase();
      const name = row.subrole_name;
      const count = row.count;

      if (counts[type]) {
        counts[type].total += count;
        counts.total_users += count;
        tempSubroles[type].push({ name, count });
      }
    }

    // Sort subroles by count descending and build final object
    for (const type of ["trainee", "supervisor", "admin"]) {
      tempSubroles[type]
        .sort((a, b) => b.count - a.count)
        .forEach((sub) => {
          counts[type].subroles[sub.name] = sub.count;
        });
    }

    res.status(200).json({ counts });
  } catch (error) {
    console.error("Error fetching user counts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getEducationalSupervisors = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT User_ID, name FROM users WHERE role = (
                SELECT id FROM usertypes WHERE name = 'educational_supervisor'
            )`
    );

    res.status(200).json({
      educational_supervisors: rows,
    });
  } catch (error) {
    console.error("Error fetching educational supervisors:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getClinicalSupervisorsOrClinics = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT User_ID, name FROM users WHERE role IN (
                SELECT id FROM usertypes WHERE name IN ('clinical_supervisor', 'clinic')
            )`
    );

    res.status(200).json({
      clinical_supervisors_or_clinics: rows,
    });
  } catch (error) {
    console.error("Error fetching clinical supervisors or clinics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getSupervisors = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT User_ID, users.name AS user_name, usertypes.Name AS role_name
       FROM users 
       JOIN usertypes ON users.role = usertypes.id 
       WHERE usertypes.Type = 'Supervisor'`
    );

    // Group users by their role_name (e.g., educational_supervisor, clinical_supervisor)
    const grouped = {};
    for (const row of rows) {
      const role = row.role_name;
      if (!grouped[role]) {
        grouped[role] = [];
      }
      grouped[role].push({
        User_ID: row.User_ID,
        name: row.user_name,
      });
    }

    res.status(200).json({
      supervisors: grouped,
    });
  } catch (error) {
    console.error("Error fetching clinical supervisors or clinics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllUsersWithRoles = async (req, res) => {
  try {
    const [users] = await pool.execute(`
        SELECT 
          u.User_ID,
          u.name,
          ut.name AS role,
          u.email,
          u.BAU_ID
        FROM users u
        JOIN usertypes ut ON u.Role = ut.id
      `);

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users with roles:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const [roles] = await pool.execute(`
      SELECT id,type, name FROM usertypes
    `);

    res.status(200).json({
      roles: roles,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const getTraineeFunctions = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT Id, Name FROM functions WHERE Trainee = 1"
    );
    const functions = rows.map((f) => ({
      id: f.Id,
      name: formatFunctionName(f.Name),
    }));
    res.status(200).json(functions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching trainee functions" });
  }
};

const getAdminFunctions = async (req, res) => {
  const currentUserId = req.user.userId;

  try {
    const [currentUser] = await pool.execute(
      "SELECT role FROM users WHERE User_ID = ?",
      [currentUserId]
    );

    if (currentUser.length === 0) {
      return res.status(403).json({ message: "Unauthorized: User not found" });
    }

    const currentUsertypeId = currentUser[0].role;

    const [rows] = await pool.execute(
      `SELECT f.Id, f.Name
       FROM functions f WHERE f.Admin = 1`
    );

    const functions = rows.map((f) => ({
      id: f.Id,
      name: formatFunctionName(f.Name),
    }));
    res.status(200).json(functions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching admin functions" });
  }
};

const getSupervisorFunctions = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT Id, Name FROM functions WHERE Supervisor = 1"
    );
    const functions = rows.map((f) => ({
      id: f.Id,
      name: formatFunctionName(f.Name),
    }));
    res.status(200).json(functions);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Server error fetching supervisor functions" });
  }
};

const getTraineeSupervisors = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
         t.User_ID AS Trainee_ID,
         t.name AS Trainee_Name,
         s.User_ID AS Supervisor_ID,
         s.name AS Supervisor_Name,
         ut_s.Name AS Supervisor_Type
       FROM users t
       JOIN usertypes ut_t ON t.role = ut_t.id
       LEFT JOIN supervisor_supervisee ss ON ss.Superviseeid = t.User_ID
       LEFT JOIN users s ON ss.supervisorid = s.User_ID
       LEFT JOIN usertypes ut_s ON s.role = ut_s.id
       WHERE ut_t.Type = 'Trainee'`
    );

    const traineeMap = {};

    for (const row of rows) {
      const {
        Trainee_ID,
        Trainee_Name,
        Supervisor_ID,
        Supervisor_Name,
        Supervisor_Type,
      } = row;

      if (!traineeMap[Trainee_ID]) {
        traineeMap[Trainee_ID] = {
          Trainee_ID,
          Trainee_Name,
          supervisors: [],
        };
      }

      // Only push supervisor info if present
      if (Supervisor_ID) {
        traineeMap[Trainee_ID].supervisors.push({
          type: Supervisor_Type,
          name: Supervisor_Name,
        });
      }
    }

    const result = Object.values(traineeMap);

    res.status(200).json({ trainees: result });
  } catch (error) {
    console.error("Error fetching trainee-supervisor mapping:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getForbiddenLogs = async (req, res) => {
  try {
    const [logs] = await pool.execute(`
      SELECT 
        f.User_ID,
        u.name AS User_Name,
        f.Function_ID,
        func.Name AS Function_Name,
        f.timestamp
      FROM forbidden_logs f
      JOIN users u ON f.User_ID = u.User_ID
      JOIN functions func ON f.Function_ID = func.Id
      ORDER BY f.timestamp DESC
    `);

    // Group logs by user
    const groupedLogs = {};

    for (const log of logs) {
      if (!groupedLogs[log.User_ID]) {
        groupedLogs[log.User_ID] = {
          User_ID: log.User_ID,
          User_Name: log.User_Name,
          logs: [],
        };
      }

      groupedLogs[log.User_ID].logs.push({
        Function_ID: log.Function_ID,
        Function_Name: formatFunctionName(log.Function_Name),
        timestamp: log.timestamp,
      });
    }

    // Convert to array and sort by most recent log timestamp
    const result = Object.values(groupedLogs).sort((a, b) => {
      const aLatestTime =
        a.logs.length > 0 ? new Date(a.logs[0].timestamp) : new Date(0);
      const bLatestTime =
        b.logs.length > 0 ? new Date(b.logs[0].timestamp) : new Date(0);
      return bLatestTime - aLatestTime;
    });

    res.status(200).json({ forbidden_logs: result });
  } catch (error) {
    console.error("Error fetching forbidden logs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getContactMessagesByUser = async (req, res) => {
  try {
    const [messages] = await pool.execute(`
      SELECT id, name, message, created_at 
      FROM contact_messages 
      WHERE is_visible = 1
      ORDER BY created_at ASC
    `);

    // Group messages by user name
    const groupedMessages = {};

    for (const message of messages) {
      if (!groupedMessages[message.name]) {
        groupedMessages[message.name] = {
          user: message.name,
          messages: [],
        };
      }

      groupedMessages[message.name].messages.push({
        id: message.id,
        message: message.message,
        created_at: message.created_at,
      });
    }

    // Convert to array and sort by oldest message first
    const result = Object.values(groupedMessages).sort((a, b) => {
      const aOldestTime =
        a.messages.length > 0 ? new Date(a.messages[0].created_at) : new Date();
      const bOldestTime =
        b.messages.length > 0 ? new Date(b.messages[0].created_at) : new Date();
      return aOldestTime - bOldestTime;
    });

    res.status(200).json({
      contact_messages: result,
      total_users: result.length,
      total_messages: messages.length,
    });
  } catch (error) {
    console.error("Error fetching contact messages by user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteContactMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({ message: "Message ID is required" });
    }

    // Check if message exists
    const [message] = await pool.execute(
      "SELECT id FROM contact_messages WHERE id = ? AND is_visible = 1",
      [messageId]
    );

    if (message.length === 0) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Mark the message as not visible instead of deleting it
    await pool.execute(
      "UPDATE contact_messages SET is_visible = 0 WHERE id = ?",
      [messageId]
    );

    res.status(200).json({ message: "Message removed successfully" });
  } catch (error) {
    console.error("Error removing contact message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  addSupervisorSuperviseeRelation,
  updateSupervisorSuperviseeRelation,
  deleteSupervisorSuperviseeRelation,
  getAllContactMessages,
  getUserCountsByRole,
  getEducationalSupervisors,
  getClinicalSupervisorsOrClinics,
  getAllUsersWithRoles,
  getAllRoles,
  getTraineeFunctions,
  getAdminFunctions,
  getSupervisorFunctions,
  getSupervisors,
  getTraineeSupervisors,
  getForbiddenLogs,
  getContactMessagesByUser,
  deleteContactMessage,
};