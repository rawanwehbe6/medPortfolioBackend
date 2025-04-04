const pool = require("../config/db");

const addAccomplishment = async (req, res) => {
  try {
    if (req.user.role !== 2) {
      return res.status(403).json({ message: 'Permission denied: User is not a trainee' });
    }
    const { title, description } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.user ? req.user.userId : null; 

    // Check for required fields
    if (!userId || !title || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the title already exists for the user
    const [existingAccomplishments] = await pool.execute(
      "SELECT * FROM accomplishments WHERE User_ID = ? AND Title = ?",
      [userId, title]
    );

    if (existingAccomplishments.length > 0) {
      return res.status(400).json({ error: "An accomplishment with this title already exists." });
    }

    // Execute the SQL query to insert the accomplishment
    await pool.execute(
      "INSERT INTO accomplishments (User_ID, Title, Description, File_Path) VALUES (?, ?, ?, ?)",
      [userId, title, description, filePath || null] // Pass null if filePath is undefined
    );

    res.status(201).json({ message: "Accomplishment added successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error during accomplishment creation" });
  }
};

const updateAccomplishment = async (req, res) => {
  try {
   if (req.user.role !== 2) {
      return res.status(403).json({ message: 'Permission denied: User is not a trainee' });
    }
    const { id } = req.params; // Get the accomplishment ID from the request parameters
    const { title, description } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.user ? req.user.userId : null; 

    // Check for required fields
    if (!userId || !id) {
      return res.status(400).json({ error: "Missing required fields: userId or id" });
    }

    // Check if the accomplishment exists
    const [existingAccomplishments] = await pool.execute(
      "SELECT * FROM accomplishments WHERE id = ? AND User_ID = ?",
      [id, userId]
    );

    if (existingAccomplishments.length === 0) {
      return res.status(404).json({ error: "Accomplishment not found or does not belong to the user." });
    }

    // Prepare the SQL update query
    const updateQuery = `
      UPDATE accomplishments 
      SET Title = ?, Description = ?, File_Path = ? 
      WHERE id = ? AND User_ID = ?
    `;

    // Execute the SQL query to update the accomplishment
    await pool.execute(updateQuery, [title, description, filePath || null, id, userId]);

    res.status(200).json({ message: "Accomplishment updated successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error during accomplishment update" });
  }
};

const deleteAccomplishment = async (req, res) => {
  try {
    if (req.user.role !== 2) {
      return res.status(403).json({ message: 'Permission denied: User is not a trainee' });
    }

    const { id } = req.params; // Get the accomplishment ID from the request parameters
    const userId = req.user ? req.user.userId : null; 

    // Check for required fields
    if (!userId || !id) {
      return res.status(400).json({ error: "Missing required fields: userId or id" });
    }

    // Check if the accomplishment exists
    const [existingAccomplishments] = await pool.execute(
      "SELECT * FROM accomplishments WHERE id = ? AND User_ID = ?",
      [id, userId]
    );

    if (existingAccomplishments.length === 0) {
      return res.status(404).json({ error: "Accomplishment not found or does not belong to the user." });
    }

    // Execute the SQL query to delete the accomplishment
    await pool.execute(
      "DELETE FROM accomplishments WHERE id = ? AND User_ID = ?",
      [id, userId]
    );

    res.status(200).json({ message: "Accomplishment deleted successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error during accomplishment deletion" });
  }
};

const getAccomplishments = async (req, res) => {
  try {
    if (req.user.role !== 2) {
      return res.status(403).json({ message: 'Permission denied: User is not a trainee' });
    }

    const userId = req.user ? req.user.userId : null;

    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const [accomplishments] = await pool.execute(
      "SELECT * FROM accomplishments WHERE User_ID = ? ORDER BY id DESC",
      [userId]
    );

    res.status(200).json({ accomplishments });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while fetching accomplishments" });
  }
};

module.exports = { addAccomplishment ,updateAccomplishment,deleteAccomplishment, getAccomplishments};
