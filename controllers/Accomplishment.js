const { Console } = require("console");
const pool = require("../config/db");
const form_helper = require('../middleware/form_helper');

const addAccomplishment = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user ? req.user.userId : null; 

    // Check for required fields
    if (!userId || !title || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "File is required for an accomplishment" });
    }

    const filePath = form_helper.getPublicUrl(req.file.path);

    // Check if the title already exists for the user
    const [existingAccomplishments] = await pool.execute(
      "SELECT * FROM accomplishments WHERE User_ID = ? AND Title = ?",
      [userId, title]
    );

    if (existingAccomplishments.length > 0) {
      return res.status(400).json({ error: "An accomplishment with this title already exists." });
    }

    // Execute the SQL query to insert the accomplishment
    await pool.execute(
      "INSERT INTO accomplishments (User_ID, Title, Description, File_Path) VALUES (?, ?, ?, ?)",
      [userId, title, description, filePath]
    );

    res.status(201).json({ message: "Accomplishment added successfully", File_Path: filePath });
  } catch (err) {
    console.error("Database Error:", err);
    form_helper.cleanupUploadedFiles(req.file);
    res.status(500).json({ error: "Server error during accomplishment creation" });
  }
};

const updateAccomplishment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user ? req.user.userId : null; 

    // Check for required fields
    if (!userId || !id || !title || !description) {
      return res.status(400).json({ error: "Missing required fields: userId, id, title, or description" });
    }

    // Check if the accomplishment exists
    const [existingAccomplishments] = await pool.execute(
      "SELECT * FROM accomplishments WHERE id = ? AND User_ID = ?",
      [id, userId]
    );

    if (existingAccomplishments.length === 0) {
      return res.status(404).json({ error: "Accomplishment not found or does not belong to the user." });
    }

    let filePath = existingAccomplishments[0].File_Path;

    if (req.file) {
      // Delete old file if it exists
      await form_helper.deleteOldSignatureIfUpdated(
        "accomplishments",
        id,
        "File_Path",
        req.file.path
      );

      filePath = form_helper.getPublicUrl(req.file.path);
    }

    // Prepare the SQL update query
    const updateQuery = `
      UPDATE accomplishments 
      SET Title = ?, Description = ?, File_Path = ? 
      WHERE id = ? AND User_ID = ?
    `;

    // Execute the SQL query to update the accomplishment
    await pool.execute(updateQuery, [title, description, filePath, id, userId]);

    res.status(200).json({ message: "Accomplishment updated successfully", file_path: filePath });
  } catch (err) {
    console.error("Database Error:", err);
    form_helper.cleanupUploadedFiles(req.file);
    res.status(500).json({ error: "Server error during accomplishment update" });
  }
};

const deleteAccomplishment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.userId : null;

    if (!userId || !id) {
      return res.status(400).json({ message: "Missing required fields: userId or id" });
    }

    // Check if the accomplishment exists
    const [existing] = await pool.execute(
      "SELECT * FROM accomplishments WHERE id = ? AND User_ID = ?",
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Accomplishment not found or unauthorized." });
    }

    // Delete the file using form helper
    await form_helper.deleteSignatureFilesFromDB(
      "accomplishments",
      id,
      ["File_Path"]
    );

    // Delete the accomplishment from the database
    await pool.execute(
      "DELETE FROM accomplishments WHERE id = ? AND User_ID = ?",
      [id, userId]
    );

    res.status(200).json({ message: "Accomplishment deleted successfully." });
  } catch (err) {
    console.error("Delete Accomplishment Error:", err);
    res.status(500).json({ message: "Server error during accomplishment deletion." });
  }
};

const getAccomplishments = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null;

    if (!userId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    const [accomplishments] = await pool.execute(
      "SELECT * FROM accomplishments WHERE User_ID = ? ORDER BY id DESC",
      [userId]
    );

    res.status(200).json({ accomplishments });
  } catch (error) {
    console.error("Error in getAccomplishments:", error);
    res.status(500).json({ message: "Error fetching accomplishments." });
  }
};

module.exports = { addAccomplishment, updateAccomplishment, deleteAccomplishment, getAccomplishments };
