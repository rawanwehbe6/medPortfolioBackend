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
        if (supervisor[0].role !== 4 &&supervisor[0].role !== 3 && supervisee[0].role !== 2) {
            return res.status(403).json({ message: "Invalid roles. Supervisor must be role 3, and supervisee must be role 2." });
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
            return res.status(400).json({ message: "Both superviseeId and newSupervisorId are required." });
        }

        // Check if supervisee exists
        const [supervisee] = await pool.execute(
            "SELECT * FROM supervisor_supervisee WHERE SuperviseeID = ?",
            [superviseeId]
        );

        if (supervisee.length === 0) {
            return res.status(404).json({ message: "Supervisee does not have an assigned supervisor." });
        }

        // Check if new supervisor exists and has role 3
        const [supervisor] = await pool.execute(
            "SELECT role FROM users WHERE User_ID = ?",
            [newSupervisorId]
        );
        const [usertype] = await pool.execute(
            "SELECT Type FROM usertypes WHERE Id = ?",
            [supervisor[0].role]
        );
        console.log(usertype);
        if (supervisor.length === 0 || usertype[0].Type !== "Supervisor") {
            return res.status(403).json({ message: "Invalid not supervisor." });
        }

        // Update the supervisor assignment
        await pool.execute(
            "UPDATE supervisor_supervisee SET SupervisorID = ? WHERE SuperviseeID = ?",
            [newSupervisorId, superviseeId]
        );

        res.status(200).json({ message: "Supervisor updated successfully." });

    } catch (error) {
        console.error("Error updating supervisor-supervisee relationship:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
// Delete Supervisor-Supervisee Relationship
const deleteSupervisorSuperviseeRelation = async (req, res) => {
    try {
        const { supervisorId, superviseeId } = req.body;
        if (!supervisorId || !superviseeId) {
            return res.status(400).json({ message: "Both supervisorId and superviseeId are required." });
        }

        // Check if the relationship exists
        const [existingRelation] = await pool.execute(
            "SELECT * FROM supervisor_supervisee WHERE SupervisorID = ? AND SuperviseeID = ?",
            [supervisorId, superviseeId]
        );

        if (existingRelation.length === 0) {
            return res.status(200).json({ message: "Supervisor-supervisee relationship not found." });
        }

        // Delete the relationship
        await pool.execute(
            "DELETE FROM supervisor_supervisee WHERE SupervisorID = ? AND SuperviseeID = ?",
            [supervisorId, superviseeId]
        );

        res.status(200).json({ message: "Supervisor-supervisee relationship deleted successfully." });

    } catch (error) {
        console.error("Error deleting supervisor-supervisee relationship:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

//get all contact messages
const getAllContactMessages = async (req, res) => {
    try {
        // Verify the user is admin (role 1)
        // Query the database for all contact messages
        const [messages] = await pool.execute(
            "SELECT id, name, message, created_at FROM contact_messages ORDER BY created_at DESC"
        );

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const getUserCountsByRole = async (req, res) => {
    try {
        const [userTypes] = await pool.execute(
            `SELECT id, name FROM usertypes ORDER BY id`
        );

        let caseStatements = userTypes.map(type => {
            const columnAlias = type.name.toLowerCase().replace(/\s+/g, '_');
            return `SUM(CASE WHEN Role = ${type.id} THEN 1 ELSE 0 END) AS \`${columnAlias}\``;
        }).join(',\n                ');
        
        const [roleCounts] = await pool.execute(
            `SELECT 
                COUNT(*) AS total_users,
                ${caseStatements}
             FROM users`
        );
        
        const counts = {
            total_users: roleCounts[0].total_users,
            admin: roleCounts[0].admin || '0',
            trainee: roleCounts[0].trainee || '0',
            educational_supervisor: roleCounts[0].educational_supervisor || '0',
            clinical_supervisor: roleCounts[0].clinical_supervisor || '0'
        };
        
        res.status(200).json({
            counts: counts
        });
        
    } catch (error) {
        console.error("Error fetching user counts:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
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
            educational_supervisors: rows
        });

    } catch (error) {
        console.error("Error fetching educational supervisors:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
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
            clinical_supervisors_or_clinics: rows
        });

    } catch (error) {
        console.error("Error fetching clinical supervisors or clinics:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
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
          u.BAU_ID,
          -- Educational Supervisor (role = 3)
          (
            SELECT s1.name 
            FROM supervisor_supervisee ss1
            JOIN users s1 ON ss1.SupervisorID = s1.User_ID
            WHERE ss1.SuperviseeID = u.User_ID AND s1.role = 3
            LIMIT 1
          ) AS educational_supervisor,
          -- Clinical Supervisor (role = 4 or 5)
          (
            SELECT s2.name 
            FROM supervisor_supervisee ss2
            JOIN users s2 ON ss2.SupervisorID = s2.User_ID
            WHERE ss2.SuperviseeID = u.User_ID AND (s2.role = 4 OR s2.role = 5)
            LIMIT 1
          ) AS clinical_supervisor
        FROM users u
        JOIN usertypes ut ON u.Role = ut.id
      `);
  
      res.status(200).json({ users });
    } catch (error) {
      console.error("Error fetching users with roles:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  };

const getAllRoles = async (req, res) => {
  try {
    const [roles] = await pool.execute(`
      SELECT id,type, name FROM usertypes
    `);

    res.status(200).json({
      roles: roles
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
const getTraineeFunctions = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT Id, Name FROM functions WHERE Trainee = 1');
    const functions = rows.map(f => ({
      id: f.Id,
      name: formatFunctionName(f.Name),
    }));
    res.status(200).json(functions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching trainee functions' });
  }
};

const getAdminFunctions = async (req, res) => {
  const currentUserId = req.user.userId;

  try {
    const [currentUser] = await pool.execute(
      'SELECT role FROM users WHERE User_ID = ?',
      [currentUserId]
    );

    if (currentUser.length === 0) {
      return res.status(403).json({ message: 'Unauthorized: User not found' });
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
    res.status(500).json({ error: 'Server error fetching admin functions' });
  }
};


const getSupervisorFunctions = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT Id, Name FROM functions WHERE Supervisor = 1');
    const functions = rows.map(f => ({
      id: f.Id,
      name: formatFunctionName(f.Name),
    }));
    res.status(200).json(functions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching supervisor functions' });
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
    getAllRoles ,
    getTraineeFunctions,
    getAdminFunctions,
    getSupervisorFunctions
};