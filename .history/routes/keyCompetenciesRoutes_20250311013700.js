const express = require('express');
const key = require('../controllers/keyCompetencies');
const KCM = require('../middleware/KeyCompetenciesMiddleware.js');
const {createSurgicalExperience} = require('../controllers/keyCompetencies');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Define routes for skills
router.post('/surgical-experience', authMiddleware, createSurgicalExperience);
router.post('/create',KCM.checkTraineeRole, key.createSkill);
router.put('/update/:id',KCM.checkTraineeRole, key.updateSkill);
router.delete('/delete/:id',KCM.checkTraineeRole, key.deleteSkill);

module.exports = router;
