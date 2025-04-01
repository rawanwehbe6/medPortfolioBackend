const express = require('express');
const mortalityMorbidityController = require('../controllers/MortalityMorbidityformController.js'); 
const seminarAssessmentController = require('../controllers/SeminarAssessmentController');
const upload = require('../middleware/multerConfig');
const authMiddleware = require('../middleware/authMiddleware');
const grpa = require('../controllers/grand_round_presentation_assessment');
const cbda = require('../controllers/case-based_discussion_assessment.js');
const frp = require('../controllers/fellowResidentPerformance.js');
const journalClubController = require('../controllers/journalClubForm.js');
const miniCexController = require('../controllers/miniCexController'); 

const auth = require('../middleware/verifyToken.js');
const router = express.Router();


const uploadPNG = upload.fields([
    { name: "signature", maxCount: 1 }, // Supervisor or Resident signature
]);

const handleFileUpload = (req, res, next) => {
    uploadPNG(req, res, (err) => {
        if (err) return res.status(400).json({ error: "File upload failed" });

        if (req.user.role === 2) {
            // Role 2 (Resident) must upload a signature
            if (!req.files || !req.files.signature || req.files.signature.length === 0) {
                return res.status(400).json({ error: "PNG file is required for resident" });
            }
        }
        next();
    });
};


// Define routes
router.post('/grpacreate', auth, uploadPNG, grpa.createForm);
router.put('/grpaupdate/:id', auth, handleFileUpload, grpa.updateForm);
router.get('/grpa/:id', auth, grpa.getTupleById);
router.delete('/grpa/:id', auth, grpa.deleteTupleById);


router.post('/cbdacreate', auth, uploadPNG, cbda.createForm);
router.put('/cbdaupdate/:id', auth, handleFileUpload, cbda.updateForm);
router.get('/cbda/:id', auth, cbda.getTupleById);
router.delete('/cbda/:id', auth, cbda.deleteTupleById);


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

// Seminar Assessment Form Routes
router.post(
  '/seminar-assessment', 
  authMiddleware,
  upload.fields([
    { name: 'resident_signature', maxCount: 1 },
    { name: 'assessor_signature', maxCount: 1 },
  ]),
  seminarAssessmentController.addSeminarAssessment
);

router.get(
  '/seminar-assessment', 
  authMiddleware,
  seminarAssessmentController.getSeminarAssessmentsByUserId
);

router.put(
  '/seminar-assessment/:id', 
  authMiddleware,
  upload.fields([
    { name: 'resident_signature', maxCount: 1 },
    { name: 'assessor_signature', maxCount: 1 },
  ]),
  seminarAssessmentController.updateSeminarAssessment
);

router.delete(
  '/seminar-assessment/:id', 
  authMiddleware,
  seminarAssessmentController.deleteSeminarAssessment
);

//fellow resident form routes
router.post('/fellow-eval', auth, frp.createForm);
router.put('/fellow-eval/:id', auth, frp.updateForm);
router.get('/fellow-eval/:id', auth, frp.getTupleById);
router.delete('/fellow-eval/:id', auth, frp.deleteTupleById);

// Journal Club Assessment Routes
router.post('/journal-club', auth, uploadPNG, journalClubController.createAssessment);
router.put('/journal-club/:id', auth, handleFileUpload, journalClubController.updateAssessment);
router.get('/journal-club/:id', auth, journalClubController.getAssessmentById);
router.delete('/journal-club/:id', auth, journalClubController.deleteAssessmentById);
module.exports = router;

// Mini-CEX Routes
router.post('/mini-cex', auth, uploadPNG, miniCexController.createMiniCEX);
router.put('/mini-cex/:id', auth, /*handleFileUpload,*/ miniCexController.updateMiniCEX);
router.post('/mini-cex/:id/sign', auth, handleFileUpload, miniCexController.signMiniCEX);
router.post('/mini-cex/:formId/send', auth, miniCexController.sendMiniCEXToTrainee);
router.get('/mini-cex/:id', auth, miniCexController.getMiniCEXById);
router.delete('/mini-cex/:id', auth, miniCexController.deleteMiniCEXById);


