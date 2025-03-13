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

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Email:', email, 'Password:', password);

  try {
    // Execute query to fetch user by email
    const [rows] = await pool.execute('SELECT * FROM USERS WHERE Email = ?', [email]);

    // Log the database result
    console.log('Database query result:', rows);

    // Check if user exists
    if (rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Extract the user data
    const user = rows[0];

    console.log('User data:', user);

    // Check if the stored password is valid
    const validPassword = await bcrypt.compare(password, user.Password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.User_ID, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Server error during login', details: err.message });
  }
};


const updateUser = async (req, res) => {
  const { email, newEmail, name, password, role } = req.body;

  try {
    // Check if user exists
    const [existingUser] = await pool.execute('SELECT * FROM USERS WHERE Email = ?', [email]);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If changing email, check if new email is already taken
    if (newEmail) {
      const [emailCheck] = await pool.execute('SELECT * FROM USERS WHERE Email = ?', [newEmail]);
      if (emailCheck.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Hash new password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Construct update query dynamically
    const updates = [];
    const values = [];

    if (newEmail) {
      updates.push('Email = ?');
      values.push(newEmail);
    }
    if (name) {
      updates.push('Name = ?');
      values.push(name);
    }
    if (hashedPassword) {
      updates.push('Password = ?');
      values.push(hashedPassword);
    }
    if (role) {
      updates.push('Role = ?');
      values.push(role);
    }

    // Ensure at least one field is updated
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    // Execute the update query
    values.push(email); // Add email to match the correct user
    const query = `UPDATE USERS SET ${updates.join(', ')} WHERE Email = ?`;

    await pool.execute(query, values);

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during update' });
  }
};

const deleteUser = async (req, res) => {
  const { email } = req.body; // Expect email in the request body

  // Ensure only admins can delete users
  if (req.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Only admins can delete users.' });
  }

  try {
    // Check if the user exists
    const [users] = await pool.execute('SELECT * FROM USERS WHERE Email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user from the database
    const [deleteResult] = await pool.execute('DELETE FROM USERS WHERE Email = ?', [email]);

    // Ensure the user was actually deleted
    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during user deletion' });
  }
};


module.exports = {
  register,
  login,
  updateUser,
  deleteUser,
};