const pool = require("../config/db");
const jwt = require('jsonwebtoken');

const addSurgicalExperience = async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    // Verify the token and extract user information
    if (token) {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    }

    const { procedureName, date, role, clinic, description } = req.body;
    const userId = req.user ? req.user.userId : null; // Ensure this is correctly set

    // Check for required fields
    if (!userId || !procedureName || !date || !role || !clinic || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Execute the SQL query to insert the surgical experience
    await pool.execute(
        "INSERT INTO surgical_experiences (User_ID, Procedure_Name, Date, Role, Clinic, Description) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, procedureName, date, role, clinic, description]
      );      

    res.status(201).json({ message: "Surgical experience added successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error during surgical experience creation" });
  }
};

const updateSurgicalExperience = async (req, res) => {
    try {
      // Extract token from Authorization header
      const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
      // Verify the token and extract user information
      if (token) {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
      }
  
      const { id } = req.params;  // Get the surgical experience ID from the request parameters
      const { procedureName, date, role, clinic, description } = req.body;
      const userId = req.user ? req.user.userId : null;  // Ensure this is correctly set
  
      // Check for required fields
      if (!userId || !id) {
        return res.status(400).json({ error: "Missing required fields: userId or id" });
      }
  
      // Check if the surgical experience exists
      const [existingExperiences] = await pool.execute(
        "SELECT * FROM surgical_experiences WHERE Experience_ID = ? AND User_ID = ?",  // Use Experience_ID instead of id
        [id, userId]
      );
  
      if (existingExperiences.length === 0) {
        return res.status(404).json({ error: "Surgical experience not found or does not belong to the user." });
      }
  
      // Prepare the SQL update query
      const updateQuery = `
  UPDATE surgical_experiences
  SET Procedure_Name = ?, Date = ?, Role = ?, Clinic = ?, Description = ?
  WHERE Experience_ID = ? AND User_ID = ? -- Use Experience_ID instead of id
`;

  
      // Execute the SQL query to update the surgical experience
      await pool.execute(updateQuery, [procedureName, date, role, clinic, description, id, userId]);
  
      res.status(200).json({ message: "Surgical experience updated successfully" });
    } catch (err) {
      console.error("Database Error:", err);
      res.status(500).json({ error: "Server error during surgical experience update" });
    }
  };
  
const deleteSurgicalExperience = async (req, res) => {
  try {
    const { id } = req.params; // Get the surgical experience ID from the request parameters
    const userId = req.user ? req.user.userId : null; // Ensure this is correctly set

    // Check for required fields
    if (!userId || !id) {
      return res.status(400).json({ error: "Missing required fields: userId or id" });
    }

    // Check if the surgical experience exists
    const [existingExperiences] = await pool.execute(
      "SELECT * FROM surgical_experiences WHERE id = ? AND User_ID = ?",
      [id, userId]
    );

    if (existingExperiences.length === 0) {
      return res.status(404).json({ error: "Surgical experience not found or does not belong to the user." });
    }

    // Execute the SQL query to delete the surgical experience
    await pool.execute(
      "DELETE FROM surgical_experiences WHERE id = ? AND User_ID = ?",
      [id, userId]
    );

    res.status(200).json({ message: "Surgical experience deleted successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error during surgical experience deletion" });
  }
};

module.exports = { addSurgicalExperience, updateSurgicalExperience, deleteSurgicalExperience };
