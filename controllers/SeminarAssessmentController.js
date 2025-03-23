const db = require('../config/db');
const upload = require('../middleware/multerConfig');

// Add a new Seminar Assessment form entry
const addSeminarAssessment = async (req, res) => {
  const {
    resident_fellow_name,
    date,
    topic,
    content,
    presentation_skills,
    use_of_audio_visual_aids,
    communication,
    handling_questions,
    audience_management,
    references,
    major_positive_feature,
    suggested_areas_for_improvement,
  } = req.body;

  // Check if files exist
  const resident_signature_path = req.files['resident_signature'] ? req.files['resident_signature'][0].path : null;
  const assessor_signature_path = req.files['assessor_signature'] ? req.files['assessor_signature'][0].path : null;

  const query = `
    INSERT INTO seminar_assessment (
      user_id,
      resident_fellow_name,
      date,
      topic,
      content,
      presentation_skills,
      use_of_audio_visual_aids,
      communication,
      handling_questions,
      audience_management,
       \`references\`,
      major_positive_feature,
      suggested_areas_for_improvement,
      resident_signature_path,
      assessor_signature_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    req.userId,
    resident_fellow_name,
    date,
    topic,
    content,
    presentation_skills,
    use_of_audio_visual_aids,
    communication,
    handling_questions,
    audience_management,
    references,
    major_positive_feature,
    suggested_areas_for_improvement,
    resident_signature_path,
    assessor_signature_path,
  ];

  try {
    const [result] = await db.execute(query, params);
    res.status(201).json({ message: 'Seminar Assessment form submitted successfully', id: result.insertId });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ message: 'Error submitting Seminar Assessment form' });
  }
};

// Get Seminar Assessment form entries by user ID
const getSeminarAssessmentsByUserId = async (req, res) => {
  const query = 'SELECT * FROM seminar_assessment WHERE user_id = ?';

  try {
    const [rows] = await db.execute(query, [req.userId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving Seminar Assessment forms' });
  }
};

// Update a Seminar Assessment form entry
const updateSeminarAssessment = async (req, res) => {
  const { id } = req.params;
  const {
    resident_fellow_name,
    date,
    topic,
    content,
    presentation_skills,
    use_of_audio_visual_aids,
    communication,
    handling_questions,
    audience_management,
    references,
    major_positive_feature,
    suggested_areas_for_improvement,
  } = req.body;

  // Check if files exist
  const resident_signature_path = req.files['resident_signature'] ? req.files['resident_signature'][0].path : null;
  const assessor_signature_path = req.files['assessor_signature'] ? req.files['assessor_signature'][0].path : null;

  const query = `
    UPDATE seminar_assessment SET
      resident_fellow_name = ?,
      date = ?,
      topic = ?,
      content = ?,
      presentation_skills = ?,
      use_of_audio_visual_aids = ?,
      communication = ?,
      handling_questions = ?,
      audience_management = ?,
       \`references\` = ?,
      major_positive_feature = ?,
      suggested_areas_for_improvement = ?,
      resident_signature_path = ?,
      assessor_signature_path = ?
    WHERE id = ? AND user_id = ?
  `;

  const params = [
    resident_fellow_name,
    date,
    topic,
    content,
    presentation_skills,
    use_of_audio_visual_aids,
    communication,
    handling_questions,
    audience_management,
    references,
    major_positive_feature,
    suggested_areas_for_improvement,
    resident_signature_path,
    assessor_signature_path,
    id,
    req.userId,
  ];

  try {
    await db.execute(query, params);
    res.status(200).json({ message: 'Seminar Assessment form updated successfully' });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ message: 'Error updating Seminar Assessment form' });
  }
};

// Delete a Seminar Assessment form entry
const deleteSeminarAssessment = async (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM seminar_assessment WHERE id = ? AND user_id = ?';

  try {
    await db.execute(query, [id, req.userId]);
    res.status(200).json({ message: 'Seminar Assessment form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting Seminar Assessment form' });
  }
};

module.exports = {
  addSeminarAssessment,
  getSeminarAssessmentsByUserId,
  updateSeminarAssessment,
  deleteSeminarAssessment,
};