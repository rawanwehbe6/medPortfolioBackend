const express = require('express');
const formController = require('../controllers/formController');
const upload = require('../middleware/multerConfig');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Add a new Mortality or Morbidity Review Assessment form entry
router.post(
  '/', 
  authMiddleware,
  upload.fields([
    { name: 'resident_signature', maxCount: 1 },
    { name: 'assessor_signature', maxCount: 1 },
  ]),
  formController.addMortalityMorbidityReviewAssessment
);

// Get Mortality or Morbidity Review Assessment form entries by user ID
router.get(
  '/', 
  authMiddleware,
  formController.getMortalityMorbidityReviewAssessmentsByUserId
);

// Update a Mortality or Morbidity Review Assessment form entry
router.put(
  '/:id', 
  authMiddleware,
  upload.fields([
    { name: 'resident_signature', maxCount: 1 },
    { name: 'assessor_signature', maxCount: 1 },
  ]),
  formController.updateMortalityMorbidityReviewAssessment
);

// Delete a Mortality or Morbidity Review Assessment form entry
router.delete(
  '/:id', 
  authMiddleware,
  formController.deleteMortalityMorbidityReviewAssessment
);

module.exports = router;