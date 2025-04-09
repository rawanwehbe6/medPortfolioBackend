const express = require("express");
const router = express.Router();
const auth2 = require('../middleware/verifyToken');
const messagesController = require('../controllers/messages_notificationsController');
router.post('/send', auth2, messagesController.createMessage);
router.get('/trainee', auth2, messagesController.getMessagesByTrainee);
router.get('/forms', auth2, messagesController.getNotifications);

module.exports = router;
