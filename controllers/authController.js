const bcrypt = require('bcrypt');// For hashing passwords
const jwt = require('jsonwebtoken');// For generating JWT tokens
const pool = require('../config/db');// Database connection

// Register new users (Only Admins Can Add Users)
const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Ensure only admins can add new users
  if (req.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Only admins can add users.' });
  }

  try {
    // Check if user already exists
    const [existingUser] = await pool.execute('SELECT * FROM USERS WHERE Email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await pool.execute('INSERT INTO USERS (Name, Email, Password, Role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login function
async function login(req, res) {
  const { email, password } = req.body;
  console.log('Email:', email, 'Password:', password);

  try {
    // Execute query to fetch user by email
    const result = await pool.execute('SELECT * FROM USERS WHERE Email = ?', [email]);

    // Log the entire result to inspect its structure
    console.log('Raw DB result:', result);

    // Check if result is not empty and is an array
    if (!result || !Array.isArray(result)) {
      return res.status(500).json({ error: 'Unexpected database query result' });
    }

    // Destructure the result (first element should be rows, second element should be fields)
    const [rows, fields] = result;
    console.log('Rows:', rows);    // This should contain the user data
    console.log('Fields:', fields);  // This should contain the metadata (optional for now)

    // Check if user exists
    if (rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Continue with password verification
    console.log('First row:', rows[0]);  // Log the first user's details

    const validPassword = await bcrypt.compare(password, rows[0].Password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: rows[0].User_ID, role: rows[0].Role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Server error during login', details: err.message });
  }
}








module.exports = {
  register,
  login,
};
