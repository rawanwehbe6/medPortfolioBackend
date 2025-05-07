const express = require('express');
const surgicalExperienceController = require('../controllers/surgicalExperienceController');
const auth = require('../middleware/auth'); 
const router = express.Router();

//routes for surgical experiences
router.post('/create', auth('create_surgicalExperience'), surgicalExperienceController.addSurgicalExperience);
router.put('/update/:id', auth('update_surgicalExperience'), surgicalExperienceController.updateSurgicalExperience);
router.delete('/delete/:id', auth('delete_surgicalExperience'), surgicalExperienceController.deleteSurgicalExperience);
router.get('/all', auth('get_surgicalExperiences'), surgicalExperienceController.getSurgicalExperiences);

module.exports = router;

