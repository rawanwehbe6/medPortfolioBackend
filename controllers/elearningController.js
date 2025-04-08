const pool = require('../config/db');

const addLearningMaterial = async (req, res) => {
  try {
    if (req.user.role !== 1 && req.user.role !== 3) {
      return res.status(403).json({ message: "Permission denied: User is not authorized" });
    }

    const { title, category, description, resource_url, host } = req.body;

    // Validate required fields
    if (!title || !category || !resource_url) {
      return res.status(400).json({ error: "Missing required fields: title, category, or resource_url" });
    }

    // Ensure `host` is provided if `category` is `workshops_activities`
    let finalHost = null;
    if (category === "workshops_activities") {
      if (!host) {
        return res.status(400).json({ error: "Host is required for workshops_activities" });
      }
      finalHost = host;
    }

    // Execute SQL query to insert new learning material
    await pool.execute(
      `INSERT INTO elearning_materials (title, category, description, resource_url, Host) VALUES (?, ?, ?, ?, ?)`,
      [title, category, description || null, resource_url, finalHost]
    );

    res.status(201).json({ message: "Learning material added successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while adding learning material" });
  }
};

const updateLearningMaterial = async (req, res) => {
  try {
    if (req.user.role !== 1 && req.user.role !== 3) {
      return res.status(403).json({ message: "Permission denied: User is not authorized" });
    }

    const { id } = req.params;
    const { title, category, description, resource_url, host } = req.body;

    // Fetch existing record
    const [existingRows] = await pool.execute(`SELECT * FROM elearning_materials WHERE id = ?`, [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: "Learning material not found" });
    }
    const existing = existingRows[0];

    // Prepare updated values
    const newTitle = title || existing.title;
    const newCategory = category || existing.category;
    const newDescription = description !== undefined ? description : existing.description;
    const newResourceUrl = resource_url || existing.resource_url;

    // If category is or was workshops_activities, ensure host is present
    const categoryToCheck = category || existing.category;
    let newHost = host !== undefined ? host : existing.Host;
    if (categoryToCheck === "workshops_activities" && !newHost) {
      return res.status(400).json({ error: "Host is required for workshops_activities" });
    }

    await pool.execute(
      `UPDATE elearning_materials SET title = ?, category = ?, description = ?, resource_url = ?, Host = ? WHERE id = ?`,
      [newTitle, newCategory, newDescription, newResourceUrl, newHost, id]
    );

    res.status(200).json({ message: "Learning material updated successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while updating learning material" });
  }
};

const deleteLearningMaterial = async (req, res) => {
  try {
    if (req.user.role !== 1 && req.user.role !== 3) {
      return res.status(403).json({ message: "Permission denied: User is not authorized" });
    }

    const { id } = req.params;

    // Check if record exists
    const [check] = await pool.execute(`SELECT id FROM elearning_materials WHERE id = ?`, [id]);
    if (check.length === 0) {
      return res.status(404).json({ error: "Learning material not found" });
    }

    await pool.execute(`DELETE FROM elearning_materials WHERE id = ?`, [id]);
    res.status(200).json({ message: "Learning material deleted successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while deleting learning material" });
  }
};


const getMedicalCourses = async (req, res) => {
  try {
    const [materials] = await pool.execute(
      "SELECT id, title, description, resource_url FROM elearning_materials WHERE category = 'medical_course'"
    );

    res.status(200).json({ materials });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while fetching medical courses" });
  }
};

const getBooksAndArticles = async (req, res) => {
  try {
    const [materials] = await pool.execute(
      "SELECT id, title, description, resource_url FROM elearning_materials WHERE category = 'books_articles'"
    );

    res.status(200).json({ materials });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while fetching books and articles" });
  }
};

const getWorkshopsAndActivities = async (req, res) => {
  try {
    const [materials] = await pool.execute(
      "SELECT id, title, description, resource_url, Host FROM elearning_materials WHERE category = 'workshops_activities'"
    );

    res.status(200).json({ materials });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while fetching workshops and activities" });
  }
};


// Called when a trainee views a material; sets status to "in_progress"
const viewMaterial = async (req, res) => {
  const { materialId } = req.params;
  const trainee_id = req.user.userId; // from JWT payload

  try {
    const sql = `
      INSERT INTO trainee_elearning_material_progress (trainee_id, material_id, status)
      VALUES (?, ?, 'in_progress')
      ON DUPLICATE KEY UPDATE status = 'in_progress'
    `;
    await pool.execute(sql, [trainee_id, materialId]);
    res.status(200).json({ message: "Material viewed, status set to 'in_progress'" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during material view' });
  }
};

// Called when a trainee completes a material; updates status to "completed"
const completeMaterial = async (req, res) => {
  const { materialId } = req.params;
  const trainee_id = req.user.userId;

  try {
    const sql = `
      UPDATE trainee_elearning_material_progress 
      SET status = 'completed', completed_at = NOW()
      WHERE trainee_id = ? AND material_id = ?
    `;
    const [result] = await pool.execute(sql, [trainee_id, materialId]);
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No progress record found. Please view the material first." });
    }
    res.status(200).json({ message: "Material marked as completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during marking material complete' });
  }
};

// Retrieves all eLearning materials with the current trainee's progress
const getProgress = async (req, res) => {
  const trainee_id = req.user.userId;

  try {
    const sql = `
      SELECT em.id, em.title, em.category, em.description, em.resource_url,
             COALESCE(tp.status, 'not_started') AS status, tp.completed_at
      FROM elearning_materials em
      LEFT JOIN trainee_elearning_material_progress tp 
        ON em.id = tp.material_id AND tp.trainee_id = ?
      ORDER BY em.uploaded_at DESC
    `;
    const [rows] = await pool.execute(sql, [trainee_id]);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during fetching progress' });
  }
};

module.exports = {
  viewMaterial,
  completeMaterial,
  getProgress,
  addLearningMaterial,
  updateLearningMaterial,
  deleteLearningMaterial,
  getMedicalCourses,
  getBooksAndArticles,
  getWorkshopsAndActivities,
};
