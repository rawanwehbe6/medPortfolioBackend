const pool = require("../config/db");
const upload = require("../middleware/multerConfig");

// Create new seminar entry
const createSeminar = async (req, res) => {
  try {
    const { date, topic, presented_attended } = req.body;
    const { userId } = req.user; // Get user from middleware

    if (!date || !topic || !presented_attended) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [result] = await pool.execute(
      `INSERT INTO seminars (date, topic, presented_attended, user_id)
       VALUES (?, ?, ?, ?)`,
      [date, topic, presented_attended, userId]
    );

    res.status(201).json({ message: "Seminar entry created", id: result.insertId });
  } catch (err) {
    console.error("Create Error:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Get all seminars
const getSeminars = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, date, topic, presented_attended, moderator_signature FROM seminars`
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Server error while fetching seminars" });
  }
};

// Delete seminar
const deleteSeminar = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const [rows] = await pool.execute("SELECT * FROM seminars WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Seminar not found" });

    if (rows[0].user_id !== userId && role !== 1) {
      return res.status(403).json({ message: "Permission denied" });
    }

    await pool.execute("DELETE FROM seminars WHERE id = ?", [id]);
    res.status(200).json({ message: "Seminar deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Server error while deleting seminar" });
  }
};

// Upload moderator signature
const signModerator = async (req, res) => {
  try {
    const { id } = req.params;
    const { moderator_signature } = req.body;

    if (!moderator_signature) {
      return res.status(400).json({ error: "Moderator signature is required" });
    }

    await pool.execute(
      `UPDATE seminars SET moderator_signature = ? WHERE id = ?`,
      [moderator_signature, id]
    );

    res.status(200).json({ message: "Moderator signature saved successfully" });
  } catch (err) {
    console.error("Signature Update Error:", err);
    res.status(500).json({ error: "Server error while saving signature" });
  }
};

// Update an existing seminar entry
const updateSeminar = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, topic, presented_attended } = req.body;

    // Check if the entry exists first
    const [rows] = await pool.execute(`SELECT * FROM seminars WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Seminar not found" });
    }

    // Update with the provided values, allowing nulls for deletion
    await pool.execute(
      `UPDATE seminars SET date = ?, topic = ?, presented_attended = ? WHERE id = ?`,
      [date || null, topic || null, presented_attended || null, id]
    );

    res.status(200).json({ message: "Seminar updated successfully" });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ error: "Server error while updating seminar", details: err.message });
  }
};

module.exports = {
  createSeminar,
  getSeminars,
  deleteSeminar,
  signModerator,
  updateSeminar,
};
