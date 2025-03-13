const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/register', authenticate, authController.register);
router.put('/updateUser', authenticate, authController.updateUser);
router.delete('/deleteUser', authenticate, authController.deleteUser);
router.post('/login', authController.login);

module.exports = router;
