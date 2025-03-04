const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", auth("register_user"), authController.registerUser);
router.put("/update/:id", auth("update_user"), authController.updateUser);
router.delete("/delete/:id", auth("delete_user"), authController.deleteUser);
router.post('/login', authController.login);
  
module.exports = router;
