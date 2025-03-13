const express = require('express');
const router = express.Router();
const { createResearch, updateResearch, deleteResearch } = require('../controllers/researchController');
const verifyToken = require('../middleware/verifyToken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Set up the file upload destination

// Routes
router.post('/research', verifyToken, upload.single('file'), createResearch); // Use 'file' as the key
router.put('/research/:id', verifyToken, upload.single('file'), updateResearch);
router.delete('/research/:id', verifyToken, deleteResearch);

module.exports = router;
