const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", auth("register_user"), authController.registerUser);
router.put("/update/:id", auth("update_user"), authController.updateUser);
router.delete("/delete/:id", auth("delete_user"), authController.deleteUser);
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const [rows] = await pool.execute("SELECT * FROM USERS WHERE Email = ?", [email]);
  
      if (rows.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }
  
      const user = rows[0];
      const validPassword = await bcrypt.compare(password, user.Password);
  
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }
  
      // Generate JWT Token
      const token = jwt.sign(
        { userId: user.User_ID, role: user.Role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      res.json({ message: "Login successful", token, role: user.Role });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });
  

module.exports = router;
