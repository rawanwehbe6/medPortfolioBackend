const pool = require("../config/db");
const upload = require("../middleware/multerConfig");

const createTeaching = async (req, res) => {
  try {
    const { activity, date, topic, rating, user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const [result] = await pool.execute(
      `INSERT INTO teaching (activity, date, topic, rating, user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [activity, date, topic, rating, user_id]
    );

    res.status(201).json({ message: "Teaching entry created", id: result.insertId });
  } catch (err) {
    console.error("Create Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

const getTeachings = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, activity, date, topic, rating, faculty_signature FROM teaching`
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteTeaching = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const [rows] = await pool.execute(`SELECT * FROM teaching WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    if (rows[0].user_id !== userId && role !== 1) {
      return res.status(403).json({ message: "Permission denied" });
    }

    await pool.execute(`DELETE FROM teaching WHERE id = ?`, [id]);
    res.status(200).json({ message: "Teaching entry deleted" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const signFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const facultySignature = req.files?.signature ? req.files.signature[0].path : null;

    if (!facultySignature) {
      return res.status(400).json({ error: "Signature image is required" });
    }

    await pool.execute(
      `UPDATE teaching SET faculty_signature = ? WHERE id = ?`,
      [facultySignature, id]
    );

    res.status(200).json({ message: "Faculty signature uploaded successfully" });
  } catch (err) {
    console.error("Signature Upload Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createTeaching,
  getTeachings,
  deleteTeaching,
  signFaculty
};
