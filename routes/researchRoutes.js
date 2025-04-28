const express = require('express');
const router = express.Router();
const { createResearch, updateResearch, deleteResearch, getResearch  } = require('../controllers/researchController');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

// Routes
router.post('/research', auth('create_research'), upload.single('file'), createResearch); 
router.put('/research/:id', auth('update_research'), upload.single('file'), updateResearch);
router.delete('/research/:id', auth('delete_research'), deleteResearch);
router.get('/research', auth('get_research'), getResearch);
module.exports = router;
