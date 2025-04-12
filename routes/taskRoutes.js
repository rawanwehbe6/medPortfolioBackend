const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// Create a new task
router.post("/add", auth("send_task"), taskController.createTask);


// Get tasks by trainee ID
router.get("/trainee", auth("get_tasks_for_trainee"), taskController.getTasksByTrainee);

module.exports = router;
