const pool = require("../config/db");
const upload = require("../middleware/multerConfig");

const createSeminar = async (req, res) => {
  try {
    const { date, topic, presented_attended, user_id } = req.body;

    if (!user_id || !date || !topic || !presented_attended) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [result] = await pool.execute(
      `INSERT INTO seminars (date, topic, presented_attended, user_id)
       VALUES (?, ?, ?, ?)`,
      [date, topic, presented_attended, user_id]
    );

    res.status(201).json({ message: "Seminar entry created", id: result.insertId });
  } catch (err) {
    console.error("Create Error:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

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

const signModerator = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Access uploaded file via multer config
      const moderatorSignature = req.files?.signature?.[0]?.path;
  
      if (!moderatorSignature) {
        return res.status(400).json({ error: "Signature image is required" });
      }
  
      await pool.execute(
        `UPDATE seminars SET moderator_signature = ? WHERE id = ?`,
        [moderatorSignature, id]
      );
  
      res.status(200).json({ message: "Moderator signature uploaded successfully" });
    } catch (err) {
      console.error("Signature Upload Error:", err);
      res.status(500).json({ error: "Server error while uploading signature" });
    }
  };
  

module.exports = {
  createSeminar,
  getSeminars,
  deleteSeminar,
  signModerator
};
