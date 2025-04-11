const express = require('express');
const router = express.Router();
const elearningController = require('../controllers/elearningController');
const auth = require('../middleware/auth');
const auth2 = require('../middleware/verifyToken');

// Route for a trainee viewing a material (automatically sets status to "in_progress")
router.post('/view/:materialId', auth('viewMaterial'), elearningController.viewMaterial);

// Route for marking a material as "completed"
router.post('/complete/:materialId', auth('completeMaterial'), elearningController.completeMaterial);

// Route for fetching eLearning progress (shows all materials with progress for the logged-in trainee)
router.get('/progress', auth('get_elearning_progress'), elearningController.getProgress);

// Add a new e-learning material
router.post("/add", auth2, elearningController.addLearningMaterial);

// Get medical courses
//router.get("/medical-courses",auth2, elearningController.getMedicalCourses);

router.get("/medical-courses", auth2, (req, res) => {
    console.log('API Call received for medical courses');  // Add this line
    elearningController.getMedicalCourses(req, res);
  });
  
// Get books & articles
router.get("/books-articles",auth2, elearningController.getBooksAndArticles);

// Get workshops & activities (Includes Host)
router.get("/workshops-activities",auth2, elearningController.getWorkshopsAndActivities);


module.exports = router;
