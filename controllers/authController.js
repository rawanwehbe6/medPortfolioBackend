const bcrypt = require('bcrypt');// For hashing passwords
const jwt = require('jsonwebtoken');// For generating JWT tokens
const pool = require('../config/db');// Database connection
const nodemailer = require("nodemailer");
require("dotenv").config();

// Register new users (Only Admins Can Add Users)
const registerUser = async (req, res) => {
  const { name, email, password, role, BAU_ID } = req.body;
 console.log("Received Data:", { name, email, password, role , BAU_ID});
  try {
    // Check if user already exists
    const [existingUser] = await pool.execute('SELECT * FROM USERS WHERE Email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);
    const [roles] = await pool.execute('SELECT id FROM USERtypes WHERE Name = ?', [role]);

    await pool.execute(
      "INSERT INTO USERS (Name, Email, Password, Role, BAU_ID) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, roles[0].id, BAU_ID || null]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login function
async function login(req, res) {
  const { email, password } = req.body;
  console.log("Email:", email, "Password:", password);

  try {
    // Execute query to fetch user by email
    const [rows] = await pool.execute("SELECT * FROM USERS WHERE Email = ?", [email]);

    console.log("Rows:", rows); // This should contain the user data

    // Check if user exists
    if (rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = rows[0]; // Get first user row

    // Validate password
    const validPassword = await bcrypt.compare(password, user.Password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.User_ID, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ message: "Login successful", token, role: user.Role });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Server error during login", details: err.message });
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
  const { newEmail, name, password, role,BAU_ID } = req.body;
  const { id } = req.params; // Get user ID from URL parameter
  console.log(req.body);
  try {
    // Check if user exists by ID
    const [existingUser] = await pool.execute('SELECT * FROM USERS WHERE User_ID = ?', [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If changing email, check if new email is already taken
    if (newEmail) {
      const [emailCheck] = await pool.execute('SELECT * FROM USERS WHERE Email = ?', [newEmail]);
      console.log(emailCheck);
      if (emailCheck.length > 0 && emailCheck[0].User_ID!=id) {
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
    if (BAU_ID) {
      updates.push('BAU_ID = ?');
      values.push(BAU_ID);
    }
    // Ensure at least one field is updated
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    // Execute the update query
    values.push(id); // Use ID to match the correct user
    const query = `UPDATE USERS SET ${updates.join(', ')} WHERE User_ID = ?`;

    await pool.execute(query, values);
    console.log(query, values);

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

// Forgot Password (Generate Reset Token)
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const [result] = await pool.execute("UPDATE USERS SET reset_token = ? WHERE Email = ?", [token, email]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

    // Send Email with Reset Link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `<p>Click <a href="${process.env.FRONTEND_URL}/forgotpass2?token=${token}">here</a> to reset your password.</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) return res.status(500).json({ message: "Email not sent", error: err });

      res.json({ message: "Password reset email sent" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password (Verify Token & Update Password)
const resetPasswordWithToken = async (req, res) => {
  const { token } = req.query.token;
  const {  newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ message: "New password is required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await pool.execute("UPDATE USERS SET Password = ?, reset_token = NULL WHERE Email = ?", [hashedPassword, decoded.email]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

//Contact us (when the user is logged in):
const contactUs = async (req, res) => {
  try {
    const { name, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ 
        message: "Both name and message are required." 
      });
    }

    // Get the user ID from the authenticated request
    const userId = req.user.userId;

    await pool.execute(
  "INSERT INTO contact_messages (name, message, user_id) VALUES (?, ?, ?)",
  [name, message, userId]
);

    res.status(201).json({ 
      message: "Your message has been sent successfully!" 
    });

  } catch (error) {
    console.error("Contact Us Error:", error);
    res.status(500).json({ 
      message: "Server error. Please try again later." 
    });
  }
};

const preLoginContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        message: "Name, email, and message are required." 
      });
    }

    // Insert into pre-login table
    await pool.execute(
      "INSERT INTO prelogin_contact_messages (name, email, message) VALUES (?, ?, ?)",
      [name, email, message]
    );

    res.status(201).json({ 
      message: "Thank you! We've received your message." 
    });

  } catch (error) {
    console.error("Pre-Login Contact Error:", error);
    res.status(500).json({ 
      message: "Server error. Please try again later." 
    });
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
  forgotPassword,
  resetPasswordWithToken,
  contactUs,
  preLoginContact
};