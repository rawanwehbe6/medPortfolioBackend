const express = require('express');
const acc = require('../controllers/Accomplishment');
const multer = require('../middleware/multerConfig');
const router = express.Router();

// Define routes for skills
router.post('/create', multer.single('file'), acc.addAccomplishment);
router.put('/update/:id', multer.single('file'), acc.updateAccomplishment);
router.delete('/delete/:id', acc.deleteAccomplishment);

module.exports = router;
