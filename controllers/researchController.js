const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// Create Research
const createResearch = async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const userId = req.user ? req.user.userId : null; // Ensure this is correctly set

    if (!title || !date || !description || !userId || !req.file) {
      return res.status(400).json({ error: "Missing required fields: title, date, description, or file." });
    }

    const filePath = req.file.path; // Store file path

    const [result] = await pool.execute(
      "INSERT INTO research (User_ID, Title, Date, Description, File_Path) VALUES (?, ?, ?, ?, ?)",
      [userId, title, date, description, filePath]
    );

    res.status(201).json({ message: "Research added successfully", researchId: result.insertId });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error during research creation" });
  }
};

// Update Research
const updateResearch = async (req, res) => {
    try {
      const { id } = req.params; // Get the research ID from the request parameters
      const { title, date, description } = req.body;
      const userId = req.user ? req.user.userId : null; // Ensure this is correctly set
  
      if (!userId || !id || !title || !date || !description) {
        return res.status(400).json({ error: "Missing required fields: userId, id, title, date, or description." });
      }
  
      // Check if the research exists
      const [existingResearches] = await pool.execute(
        "SELECT * FROM research WHERE Research_ID = ? AND User_ID = ?",
        [id, userId]
      );
  
      if (existingResearches.length === 0) {
        return res.status(404).json({ error: "Research not found or does not belong to the user." });
      }
  
      // Handle file upload if provided
      let filePath = existingResearches[0].File_Path; // Use the existing file path if no new file is uploaded
      if (req.file) {
        // Delete the old file if a new one is uploaded
        const oldFilePath = path.join(__dirname, '..', 'uploads', existingResearches[0].File_Path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
  
        filePath = req.file.path; // Store the new file path
      }
  
      // Update the research record
      await pool.execute(
        "UPDATE research SET Title = ?, Date = ?, Description = ?, File_Path = ? WHERE Research_ID = ? AND User_ID = ?",
        [title, date, description, filePath, id, userId]
      );
  
      res.status(200).json({ message: "Research updated successfully" });
    } catch (err) {
      console.error("Database Error:", err);
      res.status(500).json({ error: "Server error during research update" });
    }
  };
  
// Delete Research
const deleteResearch = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.userId : null;
  
      if (!userId || !id) {
        return res.status(400).json({ error: "Missing required fields: userId or id" });
      }
  
      // Get the research from the database
      const [existingResearches] = await pool.execute(
        "SELECT * FROM research WHERE Research_ID = ? AND User_ID = ?",
        [id, userId]
      );
  
      if (existingResearches.length === 0) {
        return res.status(404).json({ error: "Research not found or does not belong to the user." });
      }
  
      // Handle file deletion
      const filePath = existingResearches[0].File_Path;
      const fileToDelete = path.join(__dirname, '..', 'uploads', filePath); // Fix path here
  
      // Check if the file exists before attempting to delete it
      if (fs.existsSync(fileToDelete)) {
        fs.unlinkSync(fileToDelete); // Delete the file
      }
  
      // Delete the record from the database
      await pool.execute("DELETE FROM research WHERE Research_ID = ? AND User_ID = ?", [id, userId]);
  
      res.status(200).json({ message: "Research deleted successfully" });
    } catch (err) {
      console.error("Database Error:", err);
      res.status(500).json({ error: "Server error during research deletion" });
    }
  };
// Get all research papers for the logged-in user
const getResearch = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null; 

    if (!userId) {
      return res.status(403).json({ error: "Unauthorized access." });
    }

    const [researches] = await pool.execute(
      "SELECT Research_ID, Title, Date, Description, File_Path FROM research WHERE User_ID = ?",
      [userId]
    );

    res.status(200).json({ researches });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while retrieving research papers" });
  }
};

module.exports = {
  createResearch,
  updateResearch,
  deleteResearch,
  getResearch,
};
