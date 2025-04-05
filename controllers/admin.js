const pool = require('../config/db'); // Database connection

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

        if (supervisor[0].role !== 3 || supervisee[0].role !== 2) {
            return res.status(403).json({ message: "Invalid roles. Supervisor must be role 3, and supervisee must be role 2." });
        }

        // Check if the relationship already exists
        const [existingRelation] = await pool.execute(
            "SELECT * FROM supervisor_supervisee WHERE SupervisorID = ? AND SuperviseeID = ?",
            [supervisorId, superviseeId]
        );

        if (existingRelation.length > 0) {
            return res.status(409).json({ message: "This supervisor-supervisee relationship already exists." });
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

        if (supervisor.length === 0 || supervisor[0].role !== 3) {
            return res.status(403).json({ message: "Invalid supervisor. Supervisor must have role 3." });
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
            return res.status(404).json({ message: "Supervisor-supervisee relationship not found." });
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
        if (req.user.role !== 1) {
            return res.status(403).json({ 
                success: false,
                message: 'Forbidden: Admin access required' 
            });
        }

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

//get total number of users
const getUserCountsByRole = async (req, res) => {
    try {
        // Verify the user is admin (role 1)
        if (req.user.role !== 1) {
            return res.status(403).json({ 
                success: false,
                message: 'Forbidden: Admin access required' 
            });
        }

        // Get counts for specific roles and total count
       const [userTypes] = await pool.execute(
            `SELECT id, name FROM usertypes ORDER BY id`
        );
        
        // Build a dynamic SQL query based on the user types, escaping column names with backticks
        let caseStatements = userTypes.map(type => {
            const columnAlias = type.name.toLowerCase().replace(/\s+/g, '_');
            return `SUM(CASE WHEN Role = ${type.id} THEN 1 ELSE 0 END) AS \`${columnAlias}\``;
        }).join(',\n                ');
        
        // Execute the query to get counts
        const [roleCounts] = await pool.execute(
            `SELECT 
                COUNT(*) AS total_users,
                ${caseStatements}
             FROM users`
        );
        
        // Format the response
        const counts = {
            total_users: roleCounts[0].total_users
        };
        
        // Add each user type count to the response
        userTypes.forEach(type => {
            const fieldName = type.name.toLowerCase().replace(/\s+/g, '_');
            counts[fieldName] = roleCounts[0][fieldName];
        });
        
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


module.exports = { 
    addSupervisorSuperviseeRelation,
    updateSupervisorSuperviseeRelation,
    deleteSupervisorSuperviseeRelation,
    getAllContactMessages,
    getUserCountsByRole
};