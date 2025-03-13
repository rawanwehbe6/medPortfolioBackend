// controllers/surgicalExperienceController.js
const pool = require('../config/db');

// Create a new surgical experience
const createSurgicalExperience = async (req, res) => {
    const { procedureName, date, role, clinic, description } = req.body;
    
    try {
      await pool.execute(
        "INSERT INTO surgical_experiences (User_ID, Procedure_Name, Date, Role, Clinic, Description) VALUES (?, ?, ?, ?, ?, ?)",
        [req.user.userId, procedureName, date, role, clinic, description]
      );
      res.status(201).json({ message: "Surgical experience added successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error during surgical experience creation" });
    }
  };

// Update an existing surgical experience
const updateSurgicalExperience = async (req, res) => {
  const { id } = req.params; // This is the Experience_ID
  const { procedureName, date, role, clinic, description } = req.body;

  try {
    // Check if the surgical experience exists and belongs to the user
    const [experience] = await pool.execute(
      "SELECT * FROM surgical_experiences WHERE Experience_ID = ? AND User_ID = ?",
      [id, req.user.userId]
    );

    if (experience.length === 0) {
      return res.status(404).json({ message: "Surgical experience not found or unauthorized" });
    }

    // Update the surgical experience
    await pool.execute(
      "UPDATE surgical_experiences SET Procedure_Name = ?, Date = ?, Role = ?, Clinic = ?, Description = ? WHERE Experience_ID = ?",
      [procedureName, date, role, clinic, description, id]
    );

    res.json({ message: "Surgical experience updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during surgical experience update" });
  }
};

// Delete a surgical experience
const deleteSurgicalExperience = async (req, res) => {
  const { id } = req.params; // This is the Experience_ID

  try {
    // Check if the surgical experience exists and belongs to the user
    const [experience] = await pool.execute(
      "SELECT * FROM surgical_experiences WHERE Experience_ID = ? AND User_ID = ?",
      [id, req.user.userId]
    );

    if (experience.length === 0) {
      return res.status(404).json({ message: "Surgical experience not found or unauthorized" });
    }

    // Delete the surgical experience
    await pool.execute("DELETE FROM surgical_experiences WHERE Experience_ID = ?", [id]);

    res.json({ message: "Surgical experience deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during surgical experience deletion" });
  }
};

// Get all surgical experiences for the user
const getAllSurgicalExperiences = async (req, res) => {
  try {
    const [experiences] = await pool.execute(
      "SELECT * FROM surgical_experiences WHERE User_ID = ?",
      [req.user.userId]
    );

    res.status(200).json(experiences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching surgical experiences" });
  }
};

module.exports = {
  createSurgicalExperience,
  updateSurgicalExperience,
  deleteSurgicalExperience,
  getAllSurgicalExperiences
};
