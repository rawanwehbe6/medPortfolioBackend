const express = require('express');
const router = express.Router();
const elearningController = require('../controllers/elearningController');
const auth = require('../middleware/auth');

// Route for a trainee viewing a material (automatically sets status to "in_progress")
router.post('/elearning-materials/view/:materialId', auth('viewMaterial'), elearningController.viewMaterial);

// Route for marking a material as "completed"
router.post('/elearning-materials/complete/:materialId', auth('completeMaterial'), elearningController.completeMaterial);

// Route for fetching eLearning progress (shows all materials with progress for the logged-in trainee)
router.get('/elearning-materials/progress', auth('get_elearning_progress'), elearningController.getProgress);

module.exports = router;
