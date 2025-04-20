const pool = require("../config/db");

// Create new departmental activity entry
const createActivityEntry = async (req, res) => {
  try {
    const { userId } = req.user;
    const { activity_category, details, date } = req.body;

    if (!activity_category || !details || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!userId) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const [result] = await pool.execute(
      `INSERT INTO departmental_activities (activity_category, details, date, user_id)
       VALUES (?, ?, ?, ?)`,
      [activity_category, details, date, userId]
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
    const { id } = req.params;

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

// Save faculty signature as text
const signActivityFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty_signature } = req.body;

    if (!faculty_signature) {
      return res.status(400).json({ error: "Faculty signature is required" });
    }

    await pool.execute(
      `UPDATE departmental_activities SET faculty_signature = ? WHERE id = ?`,
      [faculty_signature, id]
    );

    res.status(200).json({ message: "Faculty signature added successfully" });
  } catch (err) {
    console.error("Signature Update Error:", err.stack);
    res.status(500).json({ error: "Server error while updating signature" });
  }
};

// Update an existing departmental activity entry
const updateActivityEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { activity_category, details, date } = req.body;

    if (!activity_category || !details || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [rows] = await pool.execute(`SELECT * FROM departmental_activities WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    await pool.execute(
      `UPDATE departmental_activities SET activity_category = ?, details = ?, date = ? WHERE id = ?`,
      [activity_category, details, date, id]
    );

    res.status(200).json({ message: "Departmental activity entry updated successfully" });
  } catch (err) {
    console.error("Update Error:", err.stack);
    res.status(500).json({ error: "Server error while updating entry", details: err.message });
  }
};

module.exports = {
  createActivityEntry,
  getActivityEntries,
  deleteActivityEntry,
  signActivityFaculty,
  updateActivityEntry
};
