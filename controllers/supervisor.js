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

module.exports = {
  getUsersBySupervisor
};