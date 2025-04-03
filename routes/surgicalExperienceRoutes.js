const express = require('express');
const surgicalExperienceController = require('../controllers/surgicalExperienceController');
const verifyToken = require('../middleware/verifyToken'); 
const router = express.Router();

//routes for surgical experiences
router.post('/create', verifyToken, surgicalExperienceController.addSurgicalExperience);
router.put('/update/:id', verifyToken, surgicalExperienceController.updateSurgicalExperience);
router.delete('/delete/:id', verifyToken, surgicalExperienceController.deleteSurgicalExperience);

module.exports = router;
