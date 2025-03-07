const express = require('express');
const key = require('../controllers/keyCompetencies');
const KCM = require('../middleware/KeyCompetenciesMiddleware.js');
const router = express.Router();

// Define routes for skills
router.post('/create',KCM.checkTraineeRole, key.createSkill);
router.put('/update/:id',KCM.checkTraineeRole, key.updateSkill);
router.delete('/delete/:id',KCM.checkTraineeRole, key.deleteSkill);

module.exports = router;
