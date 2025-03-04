const express = require('express');
const { createSkill, updateSkill, deleteSkill } = require('../controllers/skillsController');

const router = express.Router();

// Define routes for skills
router.post('/create', createSkill);
router.put('/update', updateSkill);
router.delete('/delete', deleteSkill);

module.exports = router;
