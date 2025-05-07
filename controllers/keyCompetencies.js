/*const pool = require('../config/db'); // Database connection

// Create a new skill
const createSkill = async (req, res) => {
  const { skillName } = req.body;
    if (req.user.role !== 2) {
      return res.status(403).json({ message: 'Permission denied: User is not a trainee' });
    }
  try {
    // Check if the skill already exists for the user
    const [existingSkill] = await pool.execute(
      "SELECT * FROM user_skills WHERE User_ID = ? AND Skill_Name = ?",
      [req.user.userId, skillName]
    );

    if (existingSkill.length > 0) {
      return res.status(400).json({ message: "Skill already exists for this user" });
    }

    // Insert skill for the user
    await pool.execute(
      "INSERT INTO user_skills (User_ID, Skill_Name) VALUES (?, ?)",
      [req.user.userId, skillName]
    );

    res.status(201).json({ message: "Skill added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during skill creation" });
  }
};

// Update an existing skill by its ID
const updateSkill = async (req, res) => {
  const { id } = req.params; // This is actually Skill_ID
  const { skillName } = req.body;
  if (req.user.role !== 2) {
      return res.status(403).json({ message: 'Permission denied: User is not a trainee' });
    }
  try {
    // Check if skill exists and belongs to the user
    const [skill] = await pool.execute(
      "SELECT * FROM user_skills WHERE Skill_ID = ? AND User_ID = ?",
      [id, req.user.userId] 
    );

    if (skill.length === 0) {
      return res.status(404).json({ message: "Skill not found or unauthorized" });
    }

    // Prevent duplicate skill names for the same user
    const [existingSkill] = await pool.execute(
      "SELECT * FROM user_skills WHERE User_ID = ? AND Skill_Name = ? AND Skill_ID != ?",
      [req.user.userId, skillName, id]
    );

    if (existingSkill.length > 0) {
      return res.status(400).json({ message: "Skill with this name already exists" });
    }

    // Update skill
    await pool.execute("UPDATE user_skills SET Skill_Name = ? WHERE Skill_ID = ?", [skillName, id]);

    res.json({ message: "Skill updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during skill update" });
  }
};
const deleteSkill = async (req, res) => {
  const { id } = req.params; // This is actually Skill_ID
  if (req.user.role !== 2) {
      return res.status(403).json({ message: 'Permission denied: User is not a trainee' });
    }
  try {
    // Check if skill exists and belongs to the user
    const [skill] = await pool.execute(
      "SELECT * FROM user_skills WHERE Skill_ID = ? AND User_ID = ?",
      [id, req.user.userId] 
    );

    if (skill.length === 0) {
      return res.status(404).json({ message: "Skill not found or unauthorized" });
    }

    // Delete skill
    await pool.execute("DELETE FROM user_skills WHERE Skill_ID = ?", [id]);

    res.json({ message: "Skill deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during skill deletion" });
  }
};

// Get all skills for the logged-in trainee
const getSkills = async (req, res) => {
  if (req.user.role !== 2) {
    return res.status(403).json({ message: 'Permission denied: User is not a trainee' });
  }

  try {
    const [skills] = await pool.execute(
      "SELECT Skill_ID, Skill_Name FROM user_skills WHERE User_ID = ?",
      [req.user.userId]
    );

    res.status(200).json({ skills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while retrieving skills" });
  }
};

module.exports = {
  createSkill,
  updateSkill,
  deleteSkill,
  getSkills,
};*/

const pool = require('../config/db'); // Database connection

// Create a new skill
const createSkill = async (req, res) => {
  const { name } = req.body;

  try {
    // Check if the skill already exists for the user
    const [existingSkill] = await pool.execute(
      "SELECT * FROM user_skills WHERE User_ID = ? AND Skill_Name = ?",
      [req.user.userId, name]
    );

    if (existingSkill.length > 0) {
      return res
        .status(400)
        .json({ message: "Skill already exists for this user" });
    }

    // Insert skill for the user
    const [result] = await pool.execute(
      "INSERT INTO user_skills (User_ID, Skill_Name) VALUES (?, ?)",
      [req.user.userId, name]
    );

    // Return the newly created skill with its ID
    res.status(201).json({
      message: "Skill added successfully",
      skill: {
        Skill_ID: result.insertId,
        Skill_Name: name,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during skill creation" });
  }
};

// Update an existing skill by its ID
const updateSkill = async (req, res) => {
  const { id } = req.params; // This is actually Skill_ID
  const { skillName, name } = req.body;
  const skill_name = skillName || name; // Accept either parameter name

  try {
    // Check if skill exists and belongs to the user
    const [skill] = await pool.execute(
      "SELECT * FROM user_skills WHERE Skill_ID = ? AND User_ID = ?",
      [id, req.user.userId]
    );

    if (skill.length === 0) {
      return res
        .status(404)
        .json({ message: "Skill not found or unauthorized" });
    }

    // Prevent duplicate skill names for the same user
    const [existingSkill] = await pool.execute(
      "SELECT * FROM user_skills WHERE User_ID = ? AND Skill_Name = ? AND Skill_ID != ?",
      [req.user.userId, skill_name, id]
    );

    if (existingSkill.length > 0) {
      return res
        .status(400)
        .json({ message: "Skill with this name already exists" });
    }

    // Update skill
    await pool.execute(
      "UPDATE user_skills SET Skill_Name = ? WHERE Skill_ID = ?",
      [skill_name, id]
    );

    res.json({
      message: "Skill updated successfully",
      skill: {
        Skill_ID: parseInt(id),
        Skill_Name: skill_name,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during skill update" });
  }
};

const deleteSkill = async (req, res) => {
  const { id } = req.params; // This is actually Skill_ID

  try {
    // Check if skill exists and belongs to the user
    const [skill] = await pool.execute(
      "SELECT * FROM user_skills WHERE Skill_ID = ? AND User_ID = ?",
      [id, req.user.userId]
    );

    if (skill.length === 0) {
      return res
        .status(404)
        .json({ message: "Skill not found or unauthorized" });
    }

    // Delete skill
    await pool.execute("DELETE FROM user_skills WHERE Skill_ID = ?", [id]);

    res.json({ message: "Skill deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during skill deletion" });
  }
};

// Get all skills for the logged-in trainee
const getSkills = async (req, res) => {
  try {
    const [skills] = await pool.execute(
      "SELECT Skill_ID, Skill_Name FROM user_skills WHERE User_ID = ?",
      [req.user.userId]
    );

    res.status(200).json({ skills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while retrieving skills" });
  }
};

module.exports = {
  createSkill,
  updateSkill,
  deleteSkill,
  getSkills,
};