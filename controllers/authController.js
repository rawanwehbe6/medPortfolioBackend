const bcrypt = require('bcrypt');// For hashing passwords
const jwt = require('jsonwebtoken');// For generating JWT tokens
const pool = require('../config/db');// Database connection
const nodemailer = require("nodemailer");
require("dotenv").config();

const registerUser = async (req, res) => {
  const { name, email, password, role, BAU_ID } = req.body;
  console.log("Received Data:", { name, email, password, role, BAU_ID });
  try {
    const [existingUser] = await pool.execute(
      "SELECT * FROM USERS WHERE Email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [roles] = await pool.execute(
      "SELECT id FROM USERtypes WHERE Name = ?",
      [role]
    );

    await pool.execute(
      "INSERT INTO USERS (Name, Email, Password, Role, BAU_ID) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, roles[0].id, BAU_ID || null]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// Login function
async function login(req, res) {
  const { email, password, id } = req.body; // 'email' can be email or BAU_ID
  console.log("email:", email, "Password:", password);
  const safe = email ? email : id;
  try {
    // Execute query to fetch user by email or BAU_ID
    const [rows] = await pool.execute(
      `SELECT * FROM USERS WHERE Email = ? OR BAU_ID = ?`,
      [safe, safe]
    );

    console.log("Rows:", rows); // Should contain matched user(s)

    // Check if user exists
    if (rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = rows[0];

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
    const [roletype] = await pool.execute(
      `SELECT Type FROM usertypes WHERE id = ? `,
      [user.Role]
    );
    res.json({
      message: "Login successful",
      token,
      Type: roletype[0].Type,
    });
  } catch (err) {
    console.error("Error during login:", err);
    res
      .status(500)
      .json({ error: "Server error during login", details: err.message });
  }
}

// Reset Password
const resetPassword = async (req, res) => {
  try {
    // Extract token from header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });

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
    const [users] = await pool.execute(
      "SELECT Password FROM USERS WHERE User_ID = ?",
      [userId]
    );
    if (users.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = users[0];

    // Validate old password
    const validOldPassword = await bcrypt.compare(oldPassword, user.Password);
    if (!validOldPassword)
      return res.status(400).json({ message: "Old password is incorrect" });

    // Check if new password matches confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    const [updateResult] = await pool.execute(
      "UPDATE USERS SET Password = ? WHERE User_ID = ?",
      [hashedNewPassword, userId]
    );

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
  const { newEmail, name, password, role, BAU_ID } = req.body;
  const { id } = req.params;
  console.log(req.body);
  try {
    const [existingUser] = await pool.execute(
      "SELECT * FROM USERS WHERE User_ID = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (newEmail) {
      const [emailCheck] = await pool.execute(
        "SELECT * FROM USERS WHERE Email = ?",
        [newEmail]
      );
      console.log(emailCheck);
      if (emailCheck.length > 0 && emailCheck[0].User_ID != id) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }
    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updates = [];
    const values = [];

    if (newEmail) {
      updates.push("Email = ?");
      values.push(newEmail);
    }
    if (name) {
      updates.push("Name = ?");
      values.push(name);
    }
    if (hashedPassword) {
      updates.push("Password = ?");
      values.push(hashedPassword);
    }
    if (role) {
      const [roles] = await pool.execute(
        "SELECT id FROM USERtypes WHERE Name = ?",
        [role]
      );
      updates.push("Role = ?");
      values.push(roles[0].id);
    }
    if (BAU_ID) {
      updates.push("BAU_ID = ?");
      values.push(BAU_ID);
    }
    if (updates.length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    values.push(id);
    const query = `UPDATE USERS SET ${updates.join(", ")} WHERE User_ID = ?`;
    console.log(query, values);
    await pool.execute(query, values);

    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during update" });
  }
};

//Delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.userId;

  // Prevent deleting the main admin user
  if (Number(id) === 1) {
    return res.status(403).json({ message: "Cannot delete the main admin user" });
  }

  // Prevent users from deleting their own account
  if (Number(currentUserId) === Number(id)) {
    return res.status(403).json({ message: "You cannot delete your own account" });
  }

  try {
    const [users] = await pool.execute(
      "SELECT * FROM USERS WHERE User_ID = ?",
      [id]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [deleteResult] = await pool.execute(
      "DELETE FROM USERS WHERE User_ID = ?",
      [id]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during user deletion" });
  }
};

//Add user type
const addUserType = async (req, res) => {
  const { name, type } = req.body;
  console.log("Received Data:", { name, type });

  const validTypes = ["Admin", "Supervisor", "Trainee"];
  if (!validTypes.includes(type)) {
    return res
      .status(400)
      .json({
        message: "Invalid type. Must be Admin, Supervisor, or Trainee.",
      });
  }

  try {
    const [existingType] = await pool.execute(
      "SELECT * FROM usertypes WHERE Name = ?",
      [name]
    );
    if (existingType.length > 0) {
      return res.status(400).json({ message: "User type already exists" });
    }

    await pool.execute("INSERT INTO usertypes (Name, Type) VALUES (?, ?)", [
      name,
      type,
    ]);
    res.status(201).json({ message: "User type added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during user type addition" });
  }
};

const updateUserType = async (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;
  const user = req.user.role;

  console.log(
    "Updating UserType ID:",
    id,
    "New Name:",
    name,
    "New Type:",
    type
  );

  if (Number(user) === Number(id)) {
    return res
      .status(403)
      .json({ message: "You cannot update your own user type." });
  }
  if (1 === Number(id)) {
    return res
      .status(403)
      .json({ message: "You cannot update The main admin." });
  }
  const validTypes = ["Admin", "Supervisor", "Trainee"];
  if (!validTypes.includes(type)) {
    return res
      .status(400)
      .json({
        message: "Invalid type. Must be Admin, Supervisor, or Trainee.",
      });
  }

  try {
    const [existing] = await pool.execute(
      "SELECT * FROM usertypes WHERE Id = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "User type not found" });
    }
    if (existing[0].Type !== type) {
      await pool.execute(
        "DELETE FROM usertype_functions WHERE UsertypeID = ?",
        [existing[0].Id]
      );
    }
    const [nameConflict] = await pool.execute(
      "SELECT * FROM usertypes WHERE Name = ? AND Id != ?",
      [name, id]
    );
    if (nameConflict.length > 0) {
      return res
        .status(400)
        .json({ message: "Another user type with this name already exists" });
    }

    await pool.execute("UPDATE usertypes SET Name = ?, Type = ? WHERE Id = ?", [
      name,
      type,
      id,
    ]);
    res.status(200).json({ message: "User type updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during user type update" });
  }
};

const deleteUserType = async (req, res) => {
  const { id } = req.params;
  const userRoleId = req.user.role;

  console.log("Deleting UserType ID:", id);

  if (Number(userRoleId) === Number(id)) {
    return res
      .status(403)
      .json({ message: "You cannot delete your own user type." });
  }

  if (Number(id) === 1) {
    return res
      .status(403)
      .json({ message: "You cannot delete the main admin user type." });
  }

  try {
    const [existing] = await pool.execute(
      "SELECT * FROM usertypes WHERE Id = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "User type not found" });
    }

    const [usersUsingType] = await pool.execute(
      "SELECT * FROM users WHERE Role = ?",
      [id]
    );
    if (usersUsingType.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "Cannot delete a user type that is currently assigned to users.",
        });
    }

    await pool.execute("DELETE FROM usertypes WHERE Id = ?", [id]);
    res.status(200).json({ message: "User type deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during user type deletion" });
  }
};

const updateUsertypeFunctions = async (req, res) => {
  const { usertypeName, newFunctionIds } = req.body;
  const currentUserId = req.user.userId;

  try {
    const [[usertype]] = await pool.execute('SELECT Id, Type FROM usertypes WHERE Name = ?', [usertypeName]);
    if (!usertype) {
      return res.status(404).json({ message: 'User type not found' });
    }

    const usertypeId = usertype.Id;
    const usertypeType = usertype.Type;

    const [[currentUser]] = await pool.execute(
      'SELECT role FROM users WHERE User_ID = ?',
      [currentUserId]
    );
    if (!currentUser) {
      return res.status(403).json({ message: 'Unauthorized: User not found' });
    }

    const currentUsertypeId = currentUser.role;

    if (1 === Number(usertypeId)) {
      return res
        .status(403)
        .json({ message: "Forbidden: You cannot edit main admin user type" });
    }


    if (currentUsertypeId === usertypeId) {
      return res.status(403).json({ message: 'Forbidden: You cannot edit your own user type' });
    }

    const [currentAssignments] = await pool.execute(
      'SELECT FunctionsId FROM usertype_functions WHERE UsertypeId = ?',
      [usertypeId]
    );
    const currentFunctionIds = currentAssignments.map(r => r.FunctionsId);

    let userAllowedFunctionIds = [];
    
    if (currentUsertypeId === 1) {
      const [rows] = await pool.execute('SELECT Id FROM functions');
      userAllowedFunctionIds = rows.map(r => r.Id);
    } else {
      const [rows] = await pool.execute(
        `SELECT FunctionsId FROM usertype_functions WHERE UsertypeId = ?`,
        [currentUsertypeId]
      );
      userAllowedFunctionIds = rows.map(r => r.FunctionsId);
    }

    const [allFunctions] = await pool.execute('SELECT Id, Admin, Trainee, Supervisor FROM functions');
    const filteredNewFunctionIds = newFunctionIds
      .filter(id => userAllowedFunctionIds.includes(id))
      .filter(id => {
        const func = allFunctions.find(f => f.Id === id);
        if (!func) return false;
        if (usertypeType === 'Admin') return func.Admin === 1;
        if (usertypeType === 'Trainee') return func.Trainee === 1;
        if (usertypeType === 'Supervisor') return func.Supervisor === 1;
        return false;
      });
      
    const modifiableCurrent = currentFunctionIds.filter(id => userAllowedFunctionIds.includes(id));
    const toDelete = modifiableCurrent.filter(id => !filteredNewFunctionIds.includes(id));
    const toAdd = filteredNewFunctionIds.filter(id => !currentFunctionIds.includes(id));

    if (toDelete.length > 0) {
      await pool.execute(
        `DELETE FROM usertype_functions WHERE UsertypeId = ? AND FunctionsId IN (${toDelete.map(() => '?').join(',')})`,
        [usertypeId, ...toDelete]
      );
    }

    if (toAdd.length > 0) {
      const insertValues = toAdd.map(id => [usertypeId, id]);
      await pool.query(
        "INSERT INTO usertype_functions (UsertypeId, FunctionsId) VALUES ?",
        [insertValues]
      );
    }

    res.status(200).json({ 
      message: 'User type functions updated successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during update' });
  }
};

const getUsertypeFunctions = async (req, res) => {
  const { usertypeId } = req.params;
  try {
    if (!usertypeId) {
      return res.status(404).json({ message: "User type not found" });
    }
    // Get function IDs associated with this usertype
    const [functions] = await pool.execute(
      `SELECT f.Id, f.Name
       FROM functions f
       JOIN usertype_functions uf ON f.Id = uf.FunctionsId
       WHERE uf.UsertypeId = ?`,
      [usertypeId]
    );

    res.status(200).json({ functions });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Server error retrieving user type functions" });
  }
};

const getFunctions = async (req, res) => {
  const usertypeId = req.user.role;
  try {
    if (!usertypeId) {
      return res.status(404).json({ message: "User type not found" });
    }
    let [functions] = [];
    if (usertypeId > 1) {
      [functions] = await pool.execute(
        `SELECT f.Id, f.Name
       FROM functions f
       JOIN usertype_functions uf ON f.Id = uf.FunctionsId
       WHERE uf.UsertypeId = ?`,
        [usertypeId]
      );
    } else {
      [functions] = await pool.execute(`SELECT f.Id, f.Name
       FROM functions f`);
    }

    res.status(200).json({ functions });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Server error retrieving user type functions" });
  }
};

// Forgot Password (Generate Reset Token)
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const [result] = await pool.execute(
      "UPDATE USERS SET reset_token = ? WHERE Email = ?",
      [token, email]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User not found" });

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
      if (err)
        return res.status(500).json({ message: "Email not sent", error: err });

      res.json({ message: "Password reset email sent" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password (Verify Token & Update Password)
const resetPasswordWithToken = async (req, res) => {
  const token = req.query.token;
  const { newPassword } = req.body;
  if (!newPassword)
    return res.status(400).json({ message: "New password is required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await pool.execute(
      "UPDATE USERS SET Password = ?, reset_token = NULL WHERE Email = ?",
      [hashedPassword, decoded.email]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User not found" });

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
        message: "Both name and message are required.",
      });
    }

    // Get the user ID from the authenticated request
    const userId = req.user.userId;

    await pool.execute(
      "INSERT INTO contact_messages (name, message, user_id) VALUES (?, ?, ?)",
      [name, message, userId]
    );

    res.status(201).json({
      message: "Your message has been sent successfully!",
    });
  } catch (error) {
    console.error("Contact Us Error:", error);
    res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

const preLoginContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Name, email, and message are required.",
      });
    }

    // Insert into pre-login table
    await pool.execute(
      "INSERT INTO prelogin_contact_messages (name, email, message) VALUES (?, ?, ?)",
      [name, email, message]
    );

    res.status(201).json({
      message: "Thank you! We've received your message.",
    });
  } catch (error) {
    console.error("Pre-Login Contact Error:", error);
    res.status(500).json({
      message: "Server error. Please try again later.",
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
  updateUserType,
  deleteUserType,
  forgotPassword,
  resetPasswordWithToken,
  contactUs,
  preLoginContact,
  updateUsertypeFunctions,
  getUsertypeFunctions,
  getFunctions,
};