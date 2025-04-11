const express = require('express');
const acc = require('../controllers/Accomplishment');
const multer = require('../middleware/multerConfig');
const auth = require('../middleware/auth');
const router = express.Router();

// Define routes for skills
router.post('/create', auth("create_accomplishment"), multer.single('file'), acc.addAccomplishment);
router.put('/update/:id', auth("update_accomplishment"), multer.single('file'), acc.updateAccomplishment);
router.delete('/delete/:id', auth("delete_accomplishment"), acc.deleteAccomplishment);
router.get('/all', auth("get_accomplishments"), acc.getAccomplishments);

module.exports = router;

