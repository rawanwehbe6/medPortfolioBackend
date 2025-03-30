const express = require("express");
const router = express.Router();
const auth2 = require('../middleware/verifyToken');
const messagesController = require('../controllers/messagesController');
router.post('/send', auth2, messagesController.createMessage);
router.get('/trainee', auth2, messagesController.getMessagesByTrainee);


module.exports = router;
