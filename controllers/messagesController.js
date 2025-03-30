const pool = require('../config/db');
const createMessage = async (req, res) => {
  try {
    const { subject, message, trainee_id } = req.body;

    // Ensure required fields are provided
    if (!subject || !message || !trainee_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const supervisor_id = req.user.userId; // Supervisor sending the message

    // Insert message into the database
    await pool.execute(
      "INSERT INTO messages (subject, message, trainee_id, supervisor_id) VALUES (?, ?, ?, ?)",
      [subject, message, trainee_id, supervisor_id]
    );

    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while sending message" });
  }
};
const getMessagesByTrainee = async (req, res) => {
  try {
    const trainee_id = req.user.userId;

    const [messages] = await pool.execute(
      `SELECT 
          m.subject, 
          m.message, 
          m.date, 
          u.Name AS supervisor_name 
       FROM messages m
       JOIN users u ON m.supervisor_id = u.User_ID
       WHERE m.trainee_id = ? 
       ORDER BY m.date DESC`, 
      [trainee_id]
    );

    res.status(200).json({ messages });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while fetching messages for trainee" });
  }
};

module.exports = {
  getMessagesByTrainee,
  createMessage,
};

