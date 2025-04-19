const pool = require("../config/db");

const createTeaching = async (req, res) => {
  try {
    const { userId } = req.user;
    const { activity, date, topic, rating} = req.body;

    if (!userId) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const [result] = await pool.execute(
      `INSERT INTO teaching (activity, date, topic, rating, user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [activity, date, topic, rating, userId]
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
  
      // Check if the record exists
      const [rows] = await pool.execute(`SELECT * FROM teaching WHERE id = ?`, [id]);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: "Teaching entry not found" });
      }
  
      // Directly delete the entry
      await pool.execute(`DELETE FROM teaching WHERE id = ?`, [id]);
  
      res.status(200).json({ message: "Teaching entry deleted successfully" });
    } catch (err) {
      console.error("Delete Error:", err);
      res.status(500).json({ error: "Server error while deleting teaching entry" });
    }
  };
  

  const signFaculty = async (req, res) => {
    try {
      const { id } = req.params;
      const { faculty_signature } = req.body;
  
      if (!faculty_signature) {
        return res.status(400).json({ error: "Faculty signature is required" });
      }
  
      await pool.execute(
        `UPDATE teaching SET faculty_signature = ? WHERE id = ?`,
        [faculty_signature, id]
      );
  
      res.status(200).json({ message: "Faculty signature added successfully" });
    } catch (err) {
      console.error("Signature Update Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  };
  

module.exports = {
  createTeaching,
  getTeachings,
  deleteTeaching,
  signFaculty
};
