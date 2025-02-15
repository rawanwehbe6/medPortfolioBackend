const bcrypt = require('bcrypt');// For hashing passwords
const jwt = require('jsonwebtoken');// For generating JWT tokens
const pool = require('../config/db');// Database connection

// Register new users (admin adds user)
const register = async (req, res) => { 
  const { name, email, password, role } = req.body; 

  try {
    // Check if user already exists
    const [existingUser] = await pool.promise().query('SELECT * FROM USERS WHERE Email = ?', [email]);  // Using promise-based query
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password for secure storage
    const hashedPassword = await bcrypt.hash(password, 10);  // 10 salt rounds

    // Insert the new user with the hashed password
    await pool.promise().query('INSERT INTO USERS (Name, Email, Password, Role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]); 

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login function
async function login(req, res) {
  const { email, password } = req.body;

  try {
    // Retrieve user from the database (using promise-based query)
    const [user] = await pool.promise().query('SELECT * FROM USERS WHERE Email = ?', [email]);
    if (user.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare the provided password with the stored hashed password
    const validPassword = await bcrypt.compare(password, user[0].Password);  // Ensure column name is correct (here "Password")
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate a JWT token for the authenticated user
    const token = jwt.sign({ userId: user[0].User_ID, role: user[0].Role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
}

module.exports = {
  register,
  login,
};
