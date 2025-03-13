const express = require('express');
const surgicalExperienceController = require('../controllers/surgicalExperienceController');
const verifyToken = require('../middleware/verifyToken'); // Assuming you have token verification middleware

const router = express.Router();

// Define routes for surgical experiences
router.post('/create', verifyToken, surgicalExperienceController.addSurgicalExperience);
router.put('/update/:id', verifyToken, surgicalExperienceController.updateSurgicalExperience);
router.delete('/delete/:id', verifyToken, surgicalExperienceController.deleteSurgicalExperience);

module.exports = router;
