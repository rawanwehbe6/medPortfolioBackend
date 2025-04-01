const pool = require('../config/db');
const createTask = async (req, res) => {
  try {
    const { name, deadline, description, trainee_id } = req.body;

    // Ensure required fields are provided
    if (!name || !deadline || !trainee_id ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    supervisor_id=req.user.userId;
    // Insert task into the database
    await pool.execute(
      "INSERT INTO tasks (name, deadline, description, trainee_id, supervisor_id) VALUES (?, ?, ?, ?, ?)",
      [name, deadline, description || null, trainee_id, supervisor_id]
    );

    res.status(201).json({ message: "Task created successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while creating task" });
  }
};
const getTasksByTrainee = async (req, res) => {
  try {
    const trainee_id = req.user.userId;

    const [tasks] = await pool.execute(
      `SELECT 
          t.name, 
          t.deadline, 
          t.description, 
          u.Name AS supervisor_name 
       FROM tasks t
       JOIN users u ON t.supervisor_id = u.User_ID
       WHERE t.trainee_id = ?`, 
      [trainee_id]
    );

    res.status(200).json({ tasks });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while fetching tasks for trainee" });
  }
};

module.exports = {
  getTasksByTrainee,
  createTask,
};

