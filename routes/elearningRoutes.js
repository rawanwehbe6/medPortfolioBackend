const express = require('express');
const router = express.Router();
const elearningController = require('../controllers/elearningController');
const auth = require('../middleware/auth');

// Route for a trainee viewing a material (automatically sets status to "in_progress")
router.post('/view/:materialId', auth('viewMaterial'), elearningController.viewMaterial);

// Route for marking a material as "completed"
router.post('/complete/:materialId', auth('completeMaterial'), elearningController.completeMaterial);

// Route for fetching eLearning progress (shows all materials with progress for the logged-in trainee)
router.get('/progress', auth('get_elearning_progress'), elearningController.getProgress);

// Add new e-learning material
router.post("/add", auth("add_elearning_material"), elearningController.addLearningMaterial);

// Update e-learning material
router.put("/update/:id", auth("update_elearning_material"), elearningController.updateLearningMaterial);

// Delete e-learning material
router.delete("/delete/:id", auth("delete_elearning_material"), elearningController.deleteLearningMaterial);

// Get medical courses
router.get("/medical-courses", auth("get_medical_courses"), elearningController.getMedicalCourses);

// Get books & articles
router.get("/books-articles", auth("get_books_and_articles"), elearningController.getBooksAndArticles);

// Get workshops & activities
router.get("/workshops-activities", auth("get_workshops_and_activities"), elearningController.getWorkshopsAndActivities);



module.exports = router;
