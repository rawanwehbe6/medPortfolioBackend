const pool = require("../config/db");

// Create new miscellaneous activity entry
const createMiscActivity = async (req, res) => {
  try {
    const { userId } = req.user;
    const { category, details, date } = req.body;

    if (!category || !details || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!userId) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const [result] = await pool.execute(
      `INSERT INTO miscellaneous_activities (category, details, date, user_id)
       VALUES (?, ?, ?, ?)`,
      [category, details, date, userId]
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

// Get all entries
const getAllMiscActivities = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, category, details, date, faculty_signature FROM miscellaneous_activities`
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch Error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete an entry
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

// Sign faculty (text signature)
const signMiscActivityFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty_signature } = req.body;

    if (!faculty_signature) {
      return res.status(400).json({ error: "Faculty signature is required" });
    }

    await pool.execute(
      `UPDATE miscellaneous_activities SET faculty_signature = ? WHERE id = ?`,
      [faculty_signature, id]
    );

    res.status(200).json({ message: "Signature added successfully" });
  } catch (err) {
    console.error("Signature Update Error:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

// Get single entry by ID
const getMiscActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const [rows] = await pool.execute(
      `SELECT id, category, details, date, faculty_signature FROM miscellaneous_activities WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Fetch by ID Error:", err.stack);
    res.status(500).json({ error: "Server error while fetching activity" });
  }
};

// Update an existing miscellaneous activity entry
const updateMiscActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, details, date } = req.body;

    if (!category || !details || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [rows] = await pool.execute(`SELECT * FROM miscellaneous_activities WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    await pool.execute(
      `UPDATE miscellaneous_activities SET category = ?, details = ?, date = ? WHERE id = ?`,
      [category, details, date, id]
    );

    res.status(200).json({ message: "Miscellaneous activity entry updated successfully" });
  } catch (err) {
    console.error("Update Error:", err.stack);
    res.status(500).json({ error: "Server error while updating entry", details: err.message });
  }
};

module.exports = {
  createMiscActivity,
  getAllMiscActivities,
  deleteMiscActivity,
  signMiscActivityFaculty,
  getMiscActivityById,
  updateMiscActivity
};
