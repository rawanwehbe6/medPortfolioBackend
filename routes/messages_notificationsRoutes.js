const express = require("express");
const auth = require('../middleware/auth');
const router = express.Router();
const messagesController = require('../controllers/messages_notificationsController');
router.post('/send', auth("send_message"),messagesController.createMessage );
router.get('/trainee', auth("get_messages_for_trainee"),messagesController.getMessagesByTrainee );
router.get('/forms', auth("get_message_forms"), messagesController.getNotifications);

module.exports = router;