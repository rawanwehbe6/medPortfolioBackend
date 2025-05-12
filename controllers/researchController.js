const pool = require('../config/db');
const form_helper = require('../middleware/form_helper');

// Create Research
const createResearch = async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const userId = req.user ? req.user.userId : null;

    if (!title || !date || !description || !userId || !req.file) {
      return res.status(400).json({ error: "Missing required fields: title, date, description, or file." });
    }

    const filePath = form_helper.getPublicUrl(req.file.path);

    const [result] = await pool.execute(
      "INSERT INTO research (User_ID, Title, Date, Description, File_Path) VALUES (?, ?, ?, ?, ?)",
      [userId, title, date, description, filePath]
    );

    res.status(201).json({ 
      message: "Research added successfully", 
      researchId: result.insertId, 
      File_Path: filePath 
    });
  } catch (err) {
    console.error("Database Error:", err);
    form_helper.cleanupUploadedFiles(req.file);
    res.status(500).json({ error: "Server error during research creation" });
  }
};

// Update Research
const updateResearch = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, description } = req.body;
    const userId = req.user ? req.user.userId : null;

    if (!userId || !id || !title || !date || !description) {
      return res.status(400).json({ error: "Missing required fields: userId, id, title, date, or description." });
    }
    
    const [existingResearches] = await pool.execute(
      "SELECT * FROM research WHERE id = ? AND User_ID = ?",
      [id, userId]
    );

    if (existingResearches.length === 0) {
      return res.status(404).json({ error: "Research not found or does not belong to the user." });
    }

    let filePath = existingResearches[0].File_Path;
    if (req.file) {
      await form_helper.deleteOldSignatureIfUpdated(
        "research",
        id,
        "File_Path",
        req.file.path,
        "id"
      );
      filePath = form_helper.getPublicUrl(req.file.path);
    }

    await pool.execute(
      "UPDATE research SET Title = ?, Date = ?, Description = ?, File_Path = ? WHERE id = ? AND User_ID = ?",
      [title, date, description, filePath, id, userId]
    );

    res.status(200).json({ 
      message: "Research updated successfully", 
      File_Path: filePath 
    });
  } catch (err) {
    console.error("Database Error:", err);
    if (req.file) {
      form_helper.cleanupUploadedFiles(req.file);
    }
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

    const [existingResearches] = await pool.execute(
      "SELECT * FROM research WHERE id = ? AND User_ID = ?",
      [id, userId]
    );

    if (existingResearches.length === 0) {
      return res.status(404).json({ error: "Research not found or does not belong to the user." });
    }

    await form_helper.deleteSignatureFilesFromDB(
      "research",
      id,
      ["File_Path"],
      "id"
    );

    await pool.execute("DELETE FROM research WHERE id = ? AND User_ID = ?", [id, userId]);

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

    const [researches] = await pool.execute(`
      SELECT 
        id, Title,
        DATE_FORMAT(Date, '%m/%d/%Y') AS Date,
        Description, File_Path
      FROM research
      WHERE User_ID = ?
    `, [userId]);

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
