const express = require('express');
const router = express.Router();
const { createResearch, updateResearch, deleteResearch } = require('../controllers/researchController');
const verifyToken = require('../middleware/verifyToken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

// Routes
router.post('/research', verifyToken, upload.single('file'), createResearch); 
router.put('/research/:id', verifyToken, upload.single('file'), updateResearch);
router.delete('/research/:id', verifyToken, deleteResearch);

module.exports = router;
