const express = require('express');
const authController = require('../controllers/authController');
const auth = require("../middleware/auth");
const { forgotPassword, resetPasswordWithToken } = require("../controllers/authController");

const router = express.Router();

router.post("/register", auth("register_user"), authController.registerUser);
router.put("/update/:id", auth("update_user"), authController.updateUser);
router.delete("/delete/:id", auth("delete_user"), authController.deleteUser);
router.post('/login', authController.login);
router.post("/reset-password", authController.resetPassword);

router.post("/add-user-type", auth("add_user_type"), authController.addUserType);
router.put("/update-user-type/:id", auth("update_user_type"), authController.updateUserType);
router.delete("/delete-user-type/:id", auth("delete_user_type"), authController.deleteUserType);

router.post('/assign-function-to-user-type', auth("assign_roles"), authController.updateUsertypeFunctions);
router.get(
  "/usertype-functions/:usertypeId",
  auth("assign_roles"),
  authController.getUsertypeFunctions
);
router.get("/functions", auth("Bypass"), authController.getFunctions);

router.post('/forgot-password', forgotPassword);
router.post("/resetPassWithToken", resetPasswordWithToken);
router.post("/contact", auth("contact_us"), authController.contactUs);
router.post("/prelogin-contact", authController.preLoginContact); 



module.exports = router;
