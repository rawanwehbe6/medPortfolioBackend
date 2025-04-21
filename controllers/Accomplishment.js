const { Console } = require("console");
const pool = require("../config/db");
const fs = require('fs');
const path = require('path');
const { FILE } = require("dns");

const addAccomplishment = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user ? req.user.userId : null; 

    // Check for required fields
    if (!userId || !title || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!req.file) {
    return res.status(400).json({ error: "File is required for an accomplishment" });
    }
    else{
      const ext = path.extname(req.file.originalname);
      let filename = req.file.filename;
      if (!filename.endsWith(ext)) {
        filename += ext;
      }
    
      filePath = `uploads/${filename}`;
    
    // You'll need to rename the actual file too
    fs.renameSync(
      path.join(__dirname, '..', 'uploads', req.file.filename),
      path.join(__dirname, '..', filePath)
    );
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

    const fullUrl = `${req.protocol}://${req.get('host')}/${filePath}`;

    res.status(201).json({ message: "Accomplishment added successfully", File_Path: filePath, image_url: fullUrl });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error during accomplishment creation" });
  }
};

const updateAccomplishment = async (req, res) => {
  try {
    const { id } = req.params; // Get the accomplishment ID from the request parameters
    const { title, description } = req.body;
    const userId = req.user ? req.user.userId : null; 

    // Check for required fields
    if (!userId || !id || !title || !description) {
      return res.status(400).json({ error: "Missing required fields: userId, id, title, or description" });
    }

    // Check if the accomplishment exists
    const [existingAccomplishments] = await pool.execute(
      "SELECT * FROM accomplishments WHERE id = ? AND User_ID = ?",
      [id, userId]
    );

    if (existingAccomplishments.length === 0) {
      return res.status(404).json({ error: "Accomplishment not found or does not belong to the user." });
    }

    // Default to existing file path if no new file is uploaded
    let filePath = existingAccomplishments[0].file_path;
    console.log( filePath );
    if (req.file) {
      // If a file is uploaded, delete the old one
      if (filePath) {
        const oldFilePath = path.join(__dirname, '..', filePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      const ext = path.extname(req.file.originalname);
      let filename = req.file.filename;
      if (!filename.endsWith(ext)) {
        filename += ext;
      }
    
      filePath = `uploads/${filename}`;

      fs.renameSync(
        path.join(__dirname, '..', 'uploads', req.file.filename),
        path.join(__dirname, '..', filePath)
      );
    }

    // Prepare the SQL update query
    const updateQuery = `
      UPDATE accomplishments 
      SET Title = ?, Description = ?, File_Path = ? 
      WHERE id = ? AND User_ID = ?
    `;

    // Execute the SQL query to update the accomplishment
    await pool.execute(updateQuery, [title, description, filePath, id, userId]);

    // Optionally, you can generate a URL for the updated file
    const fileUrl = filePath ? `${req.protocol}://${req.get('host')}/${filePath}` : null;

    res.status(200).json({ message: "Accomplishment updated successfully", file_url: fileUrl });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error during accomplishment update" });
  }
};

// Delete an existing accomplishment
const deleteAccomplishment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.userId : null;

    if (!userId || !id) {
      return res.status(400).json({ message: "Missing required fields: userId or id" });
    }

    // Check if the accomplishment exists
    const [existing] = await pool.execute(
      "SELECT * FROM accomplishments WHERE id = ? AND User_ID = ?",
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Accomplishment not found or unauthorized." });
    }

    // If there is a file associated with the accomplishment, delete it
    const filePath = existing[0].File_Path;
    if (filePath) {
      const fullPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath); // Delete the file from the server
      }
    }

    // Delete the accomplishment from the database
    await pool.execute(
      "DELETE FROM accomplishments WHERE id = ? AND User_ID = ?",
      [id, userId]
    );

    res.status(200).json({ message: "Accomplishment deleted successfully." });
  } catch (err) {
    console.error("Delete Accomplishment Error:", err);
    res.status(500).json({ message: "Server error during accomplishment deletion." });
  }
};

const getAccomplishments = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null;

    if (!userId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    const [accomplishments] = await pool.execute(
      "SELECT * FROM accomplishments WHERE User_ID = ? ORDER BY id DESC",
      [userId]
    );

  
    const accomplishmentsWithUrl = accomplishments.map(item => {
      if (!item.file_path) {
        console.log(`Warning: No file path for accomplishment with ID: ${item.id}`);
      }

      return {
        ...item,
        file_path_url: item.file_path ? `${req.protocol}://${req.get('host')}/${item.file_path}` : null
      };
    });

    res.status(200).json({ accomplishments: accomplishmentsWithUrl });
  } catch (error) {
    console.error("Error in getAccomplishments:", error);
    res.status(500).json({ message: "Error fetching accomplishments." });
  }
};


module.exports = { addAccomplishment ,updateAccomplishment,deleteAccomplishment, getAccomplishments};
