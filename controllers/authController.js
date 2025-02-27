const bcrypt = require('bcrypt');// For hashing passwords
const jwt = require('jsonwebtoken');// For generating JWT tokens
const pool = require('../config/db');// Database connection

// Register new users (Only Admins Can Add Users)
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
 console.log("Received Data:", { name, email, password, role });
  try {
    // Check if user already exists
    const [existingUser] = await pool.execute('SELECT * FROM USERS WHERE Email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await pool.execute("INSERT INTO USERS (Name, Email, Password, Role) VALUES (?, ?, ?, ?)", [
      name, email, hashedPassword, role,
    ]);

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

// Reset Password
const resetPassword = async (req, res) => {
  try {
    // Extract token from header
    const token = req.headers.authorization?.split(" ")[1]; 
    if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const userId = decoded.userId; // Extract user ID from token
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validate request body
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Fetch user from the database
    const [users] = await pool.execute("SELECT Password FROM USERS WHERE User_ID = ?", [userId]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    const user = users[0];

    // Validate old password
    const validOldPassword = await bcrypt.compare(oldPassword, user.Password);
    if (!validOldPassword) return res.status(400).json({ message: "Old password is incorrect" });

    // Check if new password matches confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    const [updateResult] = await pool.execute("UPDATE USERS SET Password = ? WHERE User_ID = ?", [hashedNewPassword, userId]);

    if (updateResult.affectedRows === 0) {
      return res.status(500).json({ message: "Failed to reset password" });
    }

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error during password reset:", err);
    res.status(500).json({ error: "Server error during password reset" });
  }
};

//Update user
const updateUser = async (req, res) => {
  const { newEmail, name, password, role } = req.body;
  const { id } = req.params; // Get user ID from URL parameter

  try {
    // Check if user exists by ID
    const [existingUser] = await pool.execute('SELECT * FROM USERS WHERE User_ID = ?', [id]);
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
    if (password && password.trim() !== '') {
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
    values.push(id); // Use ID to match the correct user
    const query = `UPDATE USERS SET ${updates.join(', ')} WHERE User_ID = ?`;

    await pool.execute(query, values);

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during update' });
  }
};

//Delete user
const deleteUser = async (req, res) => {
  const { id } = req.params; // Get user ID from URL parameter

  try {
    // Check if the user exists by User_ID
    const [users] = await pool.execute('SELECT * FROM USERS WHERE User_ID = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user from the database
    const [deleteResult] = await pool.execute('DELETE FROM USERS WHERE User_ID = ?', [id]);

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

//Add user type
const addUserType = async (req, res) => {
  const { name } = req.body;
  console.log("Received Data:", { name });
  
  try {
    // Check if user type already exists
    const [existingType] = await pool.execute('SELECT * FROM usertypes WHERE Name = ?', [name]);
    if (existingType.length > 0) {
      return res.status(400).json({ message: 'User type already exists' });
    }

    // Insert new user type (Id auto-increments)
    await pool.execute("INSERT INTO usertypes (Name) VALUES (?)", [name]);

    res.status(201).json({ message: 'User type added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during user type addition' });
  }
};

//Assign roles to user type
const assignFunctionToUserType = async (req, res) => {
  const { usertypeName, functionName } = req.body;
  console.log("Assigning Function:", { usertypeName, functionName });
  
  try {
    // Get usertype ID
    const [usertype] = await pool.execute('SELECT Id FROM usertypes WHERE Name = ?', [usertypeName]);
    if (usertype.length === 0) {
      return res.status(404).json({ message: 'User type not found' });
    }
    const usertypeId = usertype[0].Id;

    // Get function ID
    const [func] = await pool.execute('SELECT Id FROM functions WHERE Name = ?', [functionName]);
    if (func.length === 0) {
      return res.status(404).json({ message: 'Function not found' });
    }
    const functionId = func[0].Id;

    // Check if the assignment already exists
    const [existingAssignment] = await pool.execute('SELECT * FROM usertype_functions WHERE UsertypeId = ? AND FunctionsId = ?', [usertypeId, functionId]);
    if (existingAssignment.length > 0) {
      return res.status(400).json({ message: 'Function already assigned to this user type' });
    }

    // Insert new function assignment
    await pool.execute("INSERT INTO usertype_functions (UsertypeId, FunctionsId) VALUES (?, ?)", [usertypeId, functionId]);

    res.status(201).json({ message: 'Function assigned to user type successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during function assignment' });
  }
};

module.exports = {
  registerUser,
  login,
  resetPassword,
  updateUser,
  deleteUser,
  addUserType,
  assignFunctionToUserType,
};