const pool = require("../config/db");

// Create new research/publication entry
const createResearchEntry = async (req, res) => {
  try {
    const { activity, details, date, user_id } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO research_publications (activity, details, date, user_id)
       VALUES (?, ?, ?, ?)`,
      [activity, details, date, user_id || null]
    );

    res.status(201).json({
      message: "Research/Publication entry created successfully",
      id: result.insertId
    });
  } catch (err) {
    console.error("Create Error:", err);
    res.status(500).json({ error: "Server error while creating entry", details: err.message });
  }
};

// Get all entries
const getResearchEntries = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, activity, details, date, faculty_signature FROM research_publications`
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Server error while fetching entries" });
  }
};

// Delete an entry
const deleteResearchEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(`SELECT * FROM research_publications WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    await pool.execute(`DELETE FROM research_publications WHERE id = ?`, [id]);
    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Server error while deleting entry" });
  }
};

// Save faculty signature as text
const signFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty_signature } = req.body;

    if (!faculty_signature) {
      return res.status(400).json({ error: "Faculty signature is required" });
    }

    await pool.execute(
      `UPDATE research_publications SET faculty_signature = ? WHERE id = ?`,
      [faculty_signature, id]
    );

    res.status(200).json({ message: "Faculty signature added successfully" });
  } catch (err) {
    console.error("Signature Update Error:", err);
    res.status(500).json({ error: "Server error while updating signature" });
  }
};

module.exports = {
  createResearchEntry,
  getResearchEntries,
  deleteResearchEntry,
  signFaculty
};
