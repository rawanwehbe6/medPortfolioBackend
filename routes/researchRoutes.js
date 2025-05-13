const express = require('express');
const router = express.Router();
const { createResearch, updateResearch, deleteResearch, getResearch  } = require('../controllers/researchController');
const auth = require('../middleware/auth');
const upload = require('../middleware/multerConfig');

const uploadPNG = upload.fields([
    { name: "file", maxCount: 1 }, // Supervisor or Resident signature
  ]);
  
// Routes
router.post('/research', auth('create_research'), uploadPNG, createResearch);
router.put('/research/:id', auth('update_research'), uploadPNG, updateResearch);
router.delete('/research/:id', auth('delete_research'), deleteResearch);
router.get('/research', auth('get_research'), getResearch);

module.exports = router;

