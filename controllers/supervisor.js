const pool = require('../config/db'); 

const getUsersBySupervisor = async (supervisorID) => {
  try {
      console.log(`Fetching supervisees for supervisor ID: ${supervisorID}`);
      const [rows] = await pool.execute(
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
      console.log(`Found ${rows.length} supervisees`);
      return rows;
  } catch (err) {
      console.error("Error in getUsersBySupervisor:", err);
      console.error("SQL Error Code:", err.code);
      console.error("SQL Error Message:", err.sqlMessage);
      throw err;
  }
};

module.exports = {
  getUsersBySupervisor
};