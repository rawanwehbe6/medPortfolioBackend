const pool = require("../config/db");
const upload = require("../middleware/multerConfig");

const createCasePresentation = async (req, res) => {
    try {
      const { date, diagnosis_problem, presented_attended, user_id } = req.body;
  
      // Optional foreign key allowed
      const [insertResult] = await pool.execute(
        `INSERT INTO case_presentations 
        (date, diagnosis_problem, presented_attended, user_id) 
        VALUES (?, ?, ?, ?)`,
        [date, diagnosis_problem, presented_attended, user_id || null]
      );
  
      res.status(201).json({ message: "Case presentation created successfully", id: insertResult.insertId });
    } catch (err) {
      console.error("Create Error:", err);
      res.status(500).json({ error: "Server error while creating case presentation" });
    }
  };

  const deleteCasePresentation = async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, role } = req.user;
  
      // Fetch the record to validate ownership
      const [rows] = await pool.execute(
        "SELECT * FROM case_presentations WHERE id = ?",
        [id]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ error: "Case presentation not found" });
      }
  
      // Only allow deletion if the user created the record or is admin (e.g., role 1)
      if (rows[0].user_id !== userId && role !== 1) {
        return res.status(403).json({ message: "Permission denied" });
      }
  
      // Delete the record
      await pool.execute("DELETE FROM case_presentations WHERE id = ?", [id]);
  
      res.status(200).json({ message: "Case presentation deleted successfully" });
    } catch (err) {
      console.error("Delete Error:", err);
      res.status(500).json({ error: "Server error while deleting case presentation" });
    }
  };

  const getCasePresentations = async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT id, date, diagnosis_problem, moderator_signature FROM case_presentations`
      );
  
      res.status(200).json(rows);
    } catch (err) {
      console.error("Fetch Error:", err);
      res.status(500).json({ error: "Server error while fetching case presentations" });
    }
  };

  const signModerator = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Grab the signature file path
      const moderatorSignature = req.files?.signature ? req.files.signature[0].path : null;
  
      if (!moderatorSignature) {
        return res.status(400).json({ error: "Signature image is required" });
      }
  
      // Update the DB with the signature path
      await pool.execute(
        `UPDATE case_presentations SET moderator_signature = ? WHERE id = ?`,
        [moderatorSignature, id]
      );
  
      res.status(200).json({ message: "Moderator signature uploaded successfully" });
    } catch (err) {
      console.error("Upload Error:", err);
      res.status(500).json({ error: "Server error while uploading signature" });
    }
  };
  
  module.exports = {
    createCasePresentation,
    deleteCasePresentation,
    getCasePresentations,
    signModerator
  };