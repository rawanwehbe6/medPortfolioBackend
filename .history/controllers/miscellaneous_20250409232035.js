const pool = require("../config/db");
const upload = require("../middleware/multerConfig");

const createMiscActivity = async (req, res) => {
    try {
      const { category, details, date, user_id } = req.body;
  
      if (!category || !details || !date) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      const [result] = await pool.execute(
        `INSERT INTO miscellaneous_activities (category, details, date, user_id)
         VALUES (?, ?, ?, ?)`,
        [category, details, date, user_id || null]
      );
  
      res.status(201).json({
        message: "Miscellaneous activity entry created",
        id: result.insertId
      });
    } catch (err) {
      console.error("Create Error:", err.stack);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  };
  
const getAllMiscActivities = async (req, res) => {
    try {
      const [rows] = await pool.execute(`SELECT * FROM miscellaneous_activities`);
      res.status(200).json(rows);
    } catch (err) {
      console.error("Fetch Error:", err.stack);
      res.status(500).json({ error: "Server error" });
    }
  };

  const deleteMiscActivity = async (req, res) => {
    try {
      const { id } = req.params;
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
  
      const [rows] = await pool.execute(`SELECT * FROM miscellaneous_activities WHERE id = ?`, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Entry not found" });
      }
  
      await pool.execute(`DELETE FROM miscellaneous_activities WHERE id = ?`, [id]);
      res.status(200).json({ message: "Entry deleted successfully" });
    } catch (err) {
      console.error("Delete Error:", err.stack);
      res.status(500).json({ error: "Server error" });
    }
  };

  const signMiscActivityFaculty = async (req, res) => {
    try {
      const { id } = req.params;
      const facultySignature = req.files?.signature ? req.files.signature[0].path : null;
  
      if (!facultySignature) {
        return res.status(400).json({ error: "Signature image is required" });
      }
  
      await pool.execute(
        `UPDATE miscellaneous_activities SET faculty_signature = ? WHERE id = ?`,
        [facultySignature, id]
      );
  
      res.status(200).json({ message: "Signature uploaded successfully" });
    } catch (err) {
      console.error("Upload Error:", err.stack);
      res.status(500).json({ error: "Server error" });
    }
  };

  
module.exports = {
    createMiscActivity,
    getAllMiscActivities,
    deleteMiscActivity,
    signMiscActivityFaculty
  };