const pool = require('../config/db'); // Database connection

const getUsersBySupervisor = async (req, res) => {
  try {
    const supervisorId = req.user.userId; // Get supervisor ID from request token
    console.log("Supervisor ID:", supervisorId);

    // Query to fetch supervisee ID and Name
    const [supervisees] = await pool.execute(
      `SELECT u.User_ID AS superviseeId, u.Name AS superviseeName
       FROM supervisor_supervisee ss
       JOIN users u ON ss.SuperviseeID = u.User_ID
       WHERE ss.SupervisorID = ?`,
      [supervisorId]
    );

    if (supervisees.length === 0) {
      return res.status(404).json({ message: "No supervisees found under this supervisor." });
    }

    res.status(200).json({ supervisorId, supervisees });

  } catch (error) {
    console.error("Error fetching supervisees:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { getUsersBySupervisor };