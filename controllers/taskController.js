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
          t.id,
          t.deadline, 
          t.description,
          t.is_completed,
          u.Name AS supervisor_name 
       FROM tasks t
       JOIN users u ON t.supervisor_id = u.User_ID
       WHERE t.trainee_id = ?`,
      [trainee_id]
    );

    res.status(200).json({ tasks });
  } catch (err) {
    console.error("Database Error:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching tasks for trainee" });
  }
};

const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const trainee_id = req.user.userId;

    // First verify that the task belongs to this trainee
    const [task] = await pool.execute(
      "SELECT * FROM tasks WHERE id = ? AND trainee_id = ?",
      [taskId, trainee_id]
    );

    if (task.length === 0) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    // Update the task as completed
    await pool.execute("UPDATE tasks SET is_completed = true WHERE id = ?", [
      taskId,
    ]);

    res.status(200).json({ message: "Task marked as completed successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while completing task" });
  }
};

const getTasksBySupervisor = async (req, res) => {
  try {
    const supervisor_id = req.user.userId;
    const { trainee_id } = req.params;

    const [tasks] = await pool.execute(
      `SELECT 
          t.id,
          t.name, 
          t.deadline, 
          t.description,
          t.is_completed,
          u.Name AS trainee_name 
       FROM tasks t
       JOIN users u ON t.trainee_id = u.User_ID
       WHERE t.supervisor_id = ? AND t.trainee_id = ?`,
      [supervisor_id, trainee_id]
    );

    res.status(200).json({ tasks });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while fetching tasks" });
  }
};

module.exports = {
  getTasksByTrainee,
  createTask,
  completeTask,
  getTasksBySupervisor,
};

