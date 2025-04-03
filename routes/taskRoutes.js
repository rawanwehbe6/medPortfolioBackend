const express = require("express");
const router = express.Router();
const auth2 = require('../middleware/verifyToken');
const taskController = require('../controllers/taskController');

// Create a new task
router.post("/add", auth2, taskController.createTask);


// Get tasks by trainee ID
router.get("/trainee", auth2, taskController.getTasksByTrainee);

module.exports = router;
