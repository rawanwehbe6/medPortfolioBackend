const pool = require("../config/db");

// Create new case presentation
const createCasePresentation = async (req, res) => {
  try {
    const { userId } = req.user;
    const { date, diagnosis_problem, presented_attended } = req.body;

    if (!date || !diagnosis_problem || !presented_attended) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [insertResult] = await pool.execute(
      `INSERT INTO case_presentations 
       (date, diagnosis_problem, presented_attended, user_id) 
       VALUES (?, ?, ?, ?)`,
      [date, diagnosis_problem, presented_attended, userId]
    );

    res.status(201).json({
      message: "Case presentation created successfully",
      id: insertResult.insertId
    });
  } catch (err) {
    console.error("Create Error:", err.message);
    res.status(500).json({ error: "Server error while creating case presentation", details: err.message });
  }
};

// Delete a case presentation
const deleteCasePresentation = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const [rows] = await pool.execute(
      "SELECT * FROM case_presentations WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Case presentation not found" });
    }

    if (rows[0].user_id !== userId && role !== 1) {
      return res.status(403).json({ message: "Permission denied" });
    }

    await pool.execute("DELETE FROM case_presentations WHERE id = ?", [id]);

    res.status(200).json({ message: "Case presentation deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Server error while deleting case presentation" });
  }
};

// Get all case presentations
const getCasePresentations = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, date, diagnosis_problem, presented_attended, moderator_signature FROM case_presentations`
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Server error while fetching case presentations" });
  }
};

// Save moderator signature as text
const signModerator = async (req, res) => {
  try {
    const { id } = req.params;
    const { moderator_signature } = req.body;

    if (!moderator_signature) {
      return res.status(400).json({ error: "Moderator signature is required" });
    }

    await pool.execute(
      `UPDATE case_presentations SET moderator_signature = ? WHERE id = ?`,
      [moderator_signature, id]
    );

    res.status(200).json({ message: "Moderator signature added successfully" });
  } catch (err) {
    console.error("Signature Error:", err);
    res.status(500).json({ error: "Server error while saving moderator signature" });
  }
};

// Update an existing case presentation
const updateCasePresentation = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, diagnosis_problem, presented_attended } = req.body;

    if (!date || !diagnosis_problem || !presented_attended) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [rows] = await pool.execute(
      `SELECT * FROM case_presentations WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Case presentation not found" });
    }

    await pool.execute(
      `UPDATE case_presentations SET date = ?, diagnosis_problem = ?, presented_attended = ? WHERE id = ?`,
      [date, diagnosis_problem, presented_attended, id]
    );

    res.status(200).json({ message: "Case presentation updated successfully" });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ error: "Server error while updating case presentation", details: err.message });
  }
};

module.exports = {
  createCasePresentation,
  deleteCasePresentation,
  getCasePresentations,
  signModerator,
  updateCasePresentation
};
