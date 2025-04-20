const pool = require("../config/db");

// Create new research/publication entry
const createResearchEntry = async (req, res) => {
  try {
    const { userId } = req.user;
    const { activity, details, date } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const [result] = await pool.execute(
      `INSERT INTO research_publications (activity, details, date, user_id)
       VALUES (?, ?, ?, ?)`,
      [activity, details, date, userId]
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

// Update an existing research/publication entry
const updateResearchEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { activity, details, date } = req.body;

    const [rows] = await pool.execute(`SELECT * FROM research_publications WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    await pool.execute(
      `UPDATE research_publications SET activity = ?, details = ?, date = ? WHERE id = ?`,
      [activity, details, date, id]
    );

    res.status(200).json({ message: "Research/Publication entry updated successfully" });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Server error while updating entry", details: err.message });
  }
};

module.exports = {
  createResearchEntry,
  getResearchEntries,
  deleteResearchEntry,
  signFaculty,
  updateResearchEntry
};
