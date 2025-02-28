const pool = require('../config/db');

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
};
