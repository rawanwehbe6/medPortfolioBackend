const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// Create a new task
router.post("/add", auth("send_task"), taskController.createTask);

// Get tasks by trainee ID
router.get("/trainee", auth("get_tasks_for_trainee"), taskController.getTasksByTrainee);

// Complete a task (for trainees)
router.put("/complete/:taskId", auth("complete_task"), taskController.completeTask);

// Get tasks by supervisor for a specific trainee
router.get("/supervisor/:trainee_id", auth("view_trainee_tasks"), taskController.getTasksBySupervisor);

module.exports = router;
