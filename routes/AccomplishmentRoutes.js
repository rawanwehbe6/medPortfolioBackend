const express = require('express');
const acc = require('../controllers/Accomplishment');
const multer = require('../middleware/multerConfig');
const auth = require('../middleware/verifyToken.js');
const router = express.Router();

// Define routes for skills
router.post('/create', auth, multer.single('file'), acc.addAccomplishment);
router.put('/update/:id', auth, multer.single('file'), acc.updateAccomplishment);
router.delete('/delete/:id', auth, acc.deleteAccomplishment);

module.exports = router;
