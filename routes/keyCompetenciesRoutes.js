const express = require('express');
const key = require('../controllers/keyCompetencies');
const auth = require('../middleware/verifyToken.js');
const router = express.Router();
// Define routes for skills
router.post('/create', auth('create_keyCompetency'), key.createSkill);
router.put('/update/:id', auth('update_keyCompetency'), key.updateSkill);
router.delete('/delete/:id', auth('delete_keyCompetency'), key.deleteSkill);
router.get('/all', auth('get_keyCompetencies'), key.getSkills);
module.exports = router;
