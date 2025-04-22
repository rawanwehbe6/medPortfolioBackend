const pool = require('../config/db');
const fs = require('fs');
const path = require('path');
const moment = require("moment");
// Create Research
const createResearch = async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const userId = req.user ? req.user.userId : null; // Ensure this is correctly set

    if (!title || !date || !description || !userId || !req.file) {
      return res.status(400).json({ error: "Missing required fields: title, date, description, or file." });
    }

    // Only accept MM/DD/YYYY
    const parsedDate = moment(date, "MM/DD/YYYY", true);
    if (!parsedDate.isValid()) {
      return res.status(400).json({
        message: "Invalid date format. Please use MM/DD/YYYY."
      });
    }
    
    const formattedDate = parsedDate.format("YYYY-MM-DD HH:mm:ss");

    // Get the file extension from the original filename
    const ext = path.extname(req.file.originalname);
    let filename = req.file.filename;

    // Add extension only if not already there
    if (!filename.endsWith(ext)) {
      filename = `${filename}${ext}`;
    }

    const filePath = `uploads/${filename}`;

    fs.renameSync(
      path.join(__dirname, '..', 'uploads', req.file.filename),
      path.join(__dirname, '..', filePath)
    );

    const [result] = await pool.execute(
      "INSERT INTO research (User_ID, Title, Date, Description, File_Path) VALUES (?, ?, ?, ?, ?)",
      [userId, title, formattedDate, description, filePath]
    );

    //rimastesting
    const fullUrl = `${req.protocol}://${req.get('host')}/${filePath}`;

    res.status(201).json({ message: "Research added successfully", researchId: result.insertId, File_Path: filePath,
      //rimastesting
      image_url: fullUrl });
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

    // Parse & validate MM/DD/YYYY only
    const parsedDate = moment(date, "MM/DD/YYYY", true);
    if (!parsedDate.isValid()) {
      return res.status(400).json({
        message: "Invalid date format. Please use MM/DD/YYYY."
      });
    }
    const formattedDate = parsedDate.format("YYYY-MM-DD HH:mm:ss");
  
      // Handle file upload if provided
      let filePath = existingResearches[0].File_Path; // Use the existing file path if no new file is uploaded
      if (req.file) {
        // Delete the old file if a new one is uploaded
        const oldFilePath = path.join(__dirname, '..', 'uploads', existingResearches[0].File_Path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
  
          // Rename the uploaded file to include the original extension
          const ext = path.extname(req.file.originalname);
          filePath = `uploads/${req.file.filename}${ext}`;

          fs.renameSync(
            path.join(__dirname, '..', 'uploads', req.file.filename),
            path.join(__dirname, '..', filePath)
          );
      }
  
      // Update the research record
      await pool.execute(
        "UPDATE research SET Title = ?, Date = ?, Description = ?, File_Path = ? WHERE Research_ID = ? AND User_ID = ?",
        [title, formattedDate, description, filePath, id, userId]
      );
      
      // Optionally, you can generate a URL for the updated file
    const fileUrl = filePath ? `${req.protocol}://${req.get('host')}/${filePath}` : null;


      res.status(200).json({ message: "Research updated successfully", file_url: fileUrl });
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
      if(filePath){
        const fileToDelete = path.join(__dirname, '..', 'uploads', filePath);
        // Check if the file exists before attempting to delete it
        if (fs.existsSync(fileToDelete)) {
          fs.unlinkSync(fileToDelete); // Delete the file
        }
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

    /*const [researches] = await pool.execute(
      "SELECT Research_ID, Title, Date, Description, File_Path FROM research WHERE User_ID = ?",
      [userId]
    );*/
    const [researches] = await pool.execute(`
      SELECT 
        Research_ID, Title,
        DATE_FORMAT(Date, '%m/%d/%Y') AS Date,
        Description, File_Path
      FROM research
      WHERE User_ID = ?
    `, [userId]);
    
    const researchesWithUrl = researches.map(research => ({
      ...research,
      image_url: `${req.protocol}://${req.get('host')}/${research.File_Path}`
    }));

    res.status(200).json({ researches: researchesWithUrl });
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
