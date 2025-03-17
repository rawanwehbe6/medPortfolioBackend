const express = require('express');
const key = require('../controllers/keyCompetencies');
const auth = require('../middleware/verifyToken.js');
const router = express.Router();
// Define routes for skills
router.post('/create',auth, key.createSkill);
router.put('/update/:id',auth, key.updateSkill);
router.delete('/delete/:id',auth, key.deleteSkill);

module.exports = router;
