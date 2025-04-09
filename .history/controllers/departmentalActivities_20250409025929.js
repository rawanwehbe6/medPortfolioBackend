const pool = require("../config/db");
const upload = require("../middleware/multerConfig");

// Create new departmental activity entry
const createActivityEntry = async (req, res) => {
  try {
    const { activity_category, details, date, user_id } = req.body;

    if (!activity_category || !details || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [result] = await pool.execute(
      `INSERT INTO departmental_activities (activity_category, details, date, user_id)
       VALUES (?, ?, ?, ?)`,
      [activity_category, details, date, user_id || null]
    );

    res.status(201).json({
      message: "Departmental activity entry created successfully",
      id: result.insertId
    });
  } catch (err) {
    console.error("Create Error:", err.stack);
    res.status(500).json({ error: "Server error while creating entry", details: err.message });
  }
};

// Get all entries
const getActivityEntries = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, activity_category, details, date, faculty_signature FROM departmental_activities`
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch Error:", err.stack);
    res.status(500).json({ error: "Server error while fetching entries" });
  }
};

// Delete an entry
const deleteActivityEntry = async (req, res) => {
    try {
      const { id } = req.params;  // This is the parameter from the URL
  
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid entry ID" });
      }
  
      const [rows] = await pool.execute(`SELECT * FROM departmental_activities WHERE id = ?`, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Entry not found" });
      }
  
      await pool.execute(`DELETE FROM departmental_activities WHERE id = ?`, [id]);
      res.status(200).json({ message: "Entry deleted successfully" });
    } catch (err) {
      console.error("Delete Error:", err.stack);
      res.status(500).json({ error: "Server error while deleting entry" });
    }
  };
  
// Upload faculty signature
const signActivityFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const facultySignature = req.files?.signature ? req.files.signature[0].path : null;

    if (!facultySignature) {
      return res.status(400).json({ error: "Signature image is required" });
    }

    await pool.execute(
      `UPDATE departmental_activities SET faculty_signature = ? WHERE id = ?`,
      [facultySignature, id]
    );

    res.status(200).json({ message: "Faculty signature uploaded successfully" });
  } catch (err) {
    console.error("Upload Error:", err.stack);
    res.status(500).json({ error: "Server error while uploading signature" });
  }
};

module.exports = {
  createActivityEntry,
  getActivityEntries,
  deleteActivityEntry,
  signActivityFaculty
};
