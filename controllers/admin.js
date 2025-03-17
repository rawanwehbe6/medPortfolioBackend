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

        // ✅ Check if the relationship already exists
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

// ✅ Update Supervisor-Supervisee Relationship
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

        // ✅ Update the supervisor assignment
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
// ✅ Delete Supervisor-Supervisee Relationship
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

        // ✅ Delete the relationship
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

module.exports = { 
    addSupervisorSuperviseeRelation,
    updateSupervisorSuperviseeRelation,
    deleteSupervisorSuperviseeRelation
};