const express = require('express');
const mortalityMorbidityController = require('../controllers/MortalityMorbidityformController.js'); 
const upload = require('../middleware/multerConfig');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Mortality or Morbidity Review Assessment Form Routes
router.post(
  '/mortality-morbidity', 
  authMiddleware,
  upload.fields([
    { name: 'resident_signature', maxCount: 1 },
    { name: 'assessor_signature', maxCount: 1 },
  ]),
  mortalityMorbidityController.addMortalityMorbidityReviewAssessment
);

router.get(
  '/mortality-morbidity', 
  authMiddleware,
  mortalityMorbidityController.getMortalityMorbidityReviewAssessmentsByUserId
);

router.put(
  '/mortality-morbidity/:id', 
  authMiddleware,
  upload.fields([
    { name: 'resident_signature', maxCount: 1 },
    { name: 'assessor_signature', maxCount: 1 },
  ]),
  mortalityMorbidityController.updateMortalityMorbidityReviewAssessment
);

router.delete(
  '/mortality-morbidity/:id', 
  authMiddleware,
  mortalityMorbidityController.deleteMortalityMorbidityReviewAssessment
);

module.exports = router;