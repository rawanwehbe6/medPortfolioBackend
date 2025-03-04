const pool = require('../config/db'); // Database connection

// Create a new skill
const createSkill = async (req, res) => {
  const { skill } = req.body;

  try {
    // Insert skill into the database
    await pool.execute('INSERT INTO SKILLS (Skill) VALUES (?)', [skill]);
    res.status(201).json({ message: 'Skill created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during skill creation' });
  }
};

// Update an existing skill
const updateSkill = async (req, res) => {
    const { skillId, newSkill } = req.body;
  
    try {
      // Check if skill exists (use the correct column name 'id')
      const [rows] = await pool.execute('SELECT * FROM SKILLS WHERE id = ?', [skillId]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Skill not found' });
      }
  
      // Update the skill (use the correct column name 'id')
      await pool.execute('UPDATE SKILLS SET Skill = ? WHERE id = ?', [newSkill, skillId]);
      res.json({ message: 'Skill updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error during skill update' });
    }
  };
  
  

// Delete a skill
// Delete a skill
const deleteSkill = async (req, res) => {
    const { skillId } = req.body;
  
    try {
      // Check if skill exists
      const [existingSkill] = await pool.execute('SELECT * FROM SKILLS WHERE id = ?', [skillId]);
      if (existingSkill.length === 0) {
        return res.status(404).json({ message: 'Skill not found' });
      }
  
      // Delete the skill
      await pool.execute('DELETE FROM SKILLS WHERE id = ?', [skillId]);
      res.json({ message: 'Skill deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error during skill deletion' });
    }
  };
  

module.exports = {
  createSkill,
  updateSkill,
  deleteSkill,
};
