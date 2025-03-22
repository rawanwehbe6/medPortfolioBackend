const db = require('../config/db');
const upload = require('../middleware/multerConfig');

// Add a new Mortality or Morbidity Review Assessment form entry
const addMortalityMorbidityReviewAssessment = async (req, res) => {
  const {
    resident_fellow_name,
    date_of_presentation,
    diagnosis,
    cause_of_death_morbidity,
    brief_introduction,
    patient_details,
    assessment_analysis,
    review_of_literature,
    recommendations,
    handling_questions,
    overall_performance,
    major_positive_feature,
    suggested_areas_for_improvement,
  } = req.body;

  const resident_signature_path = req.files['resident_signature'][0].path;
  const assessor_signature_path = req.files['assessor_signature'][0].path;

  const query = `
    INSERT INTO mortality_morbidity_review_assessment (
      user_id,
      resident_fellow_name,
      date_of_presentation,
      diagnosis,
      cause_of_death_morbidity,
      brief_introduction,
      patient_details,
      assessment_analysis,
      review_of_literature,
      recommendations,
      handling_questions,
      overall_performance,
      major_positive_feature,
      suggested_areas_for_improvement,
      resident_signature_path,
      assessor_signature_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    req.userId,
    resident_fellow_name,
    date_of_presentation,
    diagnosis,
    cause_of_death_morbidity,
    brief_introduction,
    patient_details,
    assessment_analysis,
    review_of_literature,
    recommendations,
    handling_questions,
    overall_performance,
    major_positive_feature,
    suggested_areas_for_improvement,
    resident_signature_path,
    assessor_signature_path,
  ];

  try {
    const [result] = await db.execute(query, params);
    res.status(201).json({ message: 'Mortality or Morbidity Review Assessment form submitted successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting Mortality or Morbidity Review Assessment form' });
  }
};

// Get Mortality or Morbidity Review Assessment form entries by user ID
const getMortalityMorbidityReviewAssessmentsByUserId = async (req, res) => {
  const query = 'SELECT * FROM mortality_morbidity_review_assessment WHERE user_id = ?';

  try {
    const [rows] = await db.execute(query, [req.userId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving Mortality or Morbidity Review Assessment forms' });
  }
};

// Update a Mortality or Morbidity Review Assessment form entry
const updateMortalityMorbidityReviewAssessment = async (req, res) => {
  const { id } = req.params;
  const {
    resident_fellow_name,
    date_of_presentation,
    diagnosis,
    cause_of_death_morbidity,
    brief_introduction,
    patient_details,
    assessment_analysis,
    review_of_literature,
    recommendations,
    handling_questions,
    overall_performance,
    major_positive_feature,
    suggested_areas_for_improvement,
  } = req.body;

  const resident_signature_path = req.files['resident_signature'] ? req.files['resident_signature'][0].path : null;
  const assessor_signature_path = req.files['assessor_signature'] ? req.files['assessor_signature'][0].path : null;

  const query = `
    UPDATE mortality_morbidity_review_assessment SET
      resident_fellow_name = ?,
      date_of_presentation = ?,
      diagnosis = ?,
      cause_of_death_morbidity = ?,
      brief_introduction = ?,
      patient_details = ?,
      assessment_analysis = ?,
      review_of_literature = ?,
      recommendations = ?,
      handling_questions = ?,
      overall_performance = ?,
      major_positive_feature = ?,
      suggested_areas_for_improvement = ?,
      resident_signature_path = ?,
      assessor_signature_path = ?
    WHERE id = ? AND user_id = ?
  `;

  const params = [
    resident_fellow_name,
    date_of_presentation,
    diagnosis,
    cause_of_death_morbidity,
    brief_introduction,
    patient_details,
    assessment_analysis,
    review_of_literature,
    recommendations,
    handling_questions,
    overall_performance,
    major_positive_feature,
    suggested_areas_for_improvement,
    resident_signature_path,
    assessor_signature_path,
    id,
    req.userId,
  ];

  try {
    await db.execute(query, params);
    res.status(200).json({ message: 'Mortality or Morbidity Review Assessment form updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating Mortality or Morbidity Review Assessment form' });
  }
};

// Delete a Mortality or Morbidity Review Assessment form entry
const deleteMortalityMorbidityReviewAssessment = async (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM mortality_morbidity_review_assessment WHERE id = ? AND user_id = ?';

  try {
    await db.execute(query, [id, req.userId]);
    res.status(200).json({ message: 'Mortality or Morbidity Review Assessment form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting Mortality or Morbidity Review Assessment form' });
  }
};

module.exports = {
  addMortalityMorbidityReviewAssessment,
  getMortalityMorbidityReviewAssessmentsByUserId,
  updateMortalityMorbidityReviewAssessment,
  deleteMortalityMorbidityReviewAssessment,
};