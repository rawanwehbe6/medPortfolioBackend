const express = require('express');
const mortalityMorbidityController = require('../controllers/MortalityMorbidityformController.js'); 
const seminarAssessmentController = require('../controllers/SeminarAssessmentController');
const upload = require('../middleware/multerConfig');
const authMiddleware = require('../middleware/authMiddleware');
const auth = require('../middleware/auth');
const grpa = require('../controllers/grand_round_presentation_assessment');
const cbda = require('../controllers/case-based_discussion_assessment.js');
const frp = require('../controllers/fellowResidentPerformance.js');
const journalClubController = require('../controllers/journalClubForm.js');
const miniCexController = require('../controllers/miniCexController');
const dopsController = require('../controllers/dopsController.js'); 

const authenticate = require('../middleware/verifyToken.js');
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


// GRPA routes
router.post('/grpacreate', auth("create_grpa_form"), uploadPNG, grpa.createForm);
router.put('/grpaupdate/:id', auth("update_grpa_form"), handleFileUpload, grpa.updateForm);
router.get('/grpa/:id', auth("get_grpa_form_by_id"), grpa.getTupleById);
router.delete('/grpa/:id', auth("delete_grpa_form_by_id"), grpa.deleteTupleById);

// CBDA routes
router.post('/cbdacreate', auth("create_cbda_form"), uploadPNG, cbda.createForm);
router.put('/cbdaupdate/:id', auth("update_cbda_form"), handleFileUpload, cbda.updateForm);
router.get('/cbda/:id', auth("get_cbda_form_by_id"), cbda.getTupleById);
router.delete('/cbda/:id', auth("delete_cbda_form_by_id"), cbda.deleteTupleById);


// Mortality & Morbidity Review Assessment Form Routes
router.post('/mortality-morbidity',authenticate,uploadPNG,
  mortalityMorbidityController.createMortalityMorbidityForm);

router.put('/mortality-morbidity/:id',authenticate,handleFileUpload,
  mortalityMorbidityController.updateMortalityMorbidityForm);

router.get(
  '/mortality-morbidity/:id',
  authMiddleware,
  mortalityMorbidityController.getMortalityMorbidityFormById
);

router.delete(
  '/mortality-morbidity/:id',
  authMiddleware,
  mortalityMorbidityController.deleteMortalityMorbidityForm
);

// Seminar Assessment Form Routes
router.post('/seminar-assessment',authenticate,uploadPNG,
  seminarAssessmentController.createSeminarAssessment);

router.put('/seminar-assessment/:id',authenticate,handleFileUpload,
  seminarAssessmentController.updateSeminarAssessment);

router.get(
  '/seminar-assessment/:id',
  authMiddleware,
  seminarAssessmentController.getSeminarAssessmentById
);

router.delete(
  '/seminar-assessment/:id',
  authMiddleware,
  seminarAssessmentController.deleteSeminarAssessment
);

//fellow resident form routes
router.post("/fellow-resident/create", authenticate, upload.single("instructor_signature"), frp.createForm);
router.put('/fellow-resident/update/:id', authenticate, upload.single("instructor_signature"), frp.updateForm);
router.get('/fellow-resident/:id', authenticate, frp.getTupleById);
router.delete('/fellow-resident/:id', authenticate, frp.deleteTupleById);

// Journal Club Assessment Routes
router.post("/journal-club/create",authenticate, upload.fields([
  { name: "resident_signature", maxCount: 1 },
  { name: "assessor_signature", maxCount: 1 }
]), journalClubController.createAssessment);

router.put("/journal-club/update/:id",authenticate, upload.fields([
  { name: "resident_signature", maxCount: 1 },
  { name: "assessor_signature", maxCount: 1 }
]), journalClubController.updateAssessment);
router.get('/journal-club/:id', authenticate, journalClubController.getAssessmentById);
router.delete('/journal-club/:id', authenticate, journalClubController.deleteAssessmentById);



// Mini-CEX Routes
router.post('/mini-cex', authenticate, uploadPNG, miniCexController.createMiniCEX);
router.put('/mini-cex/:id', authenticate,  miniCexController.updateMiniCEX);
router.post('/mini-cex/:id/sign', authenticate, handleFileUpload, miniCexController.signMiniCEX);
router.post('/mini-cex/:formId/send', authenticate, miniCexController.sendMiniCEXToTrainee);
router.get('/mini-cex/:id', authenticate, miniCexController.getMiniCEXById);
router.delete('/mini-cex/:id', authenticate, miniCexController.deleteMiniCEXById);


// DOPS Routes
router.post('/dops', authenticate, uploadPNG, dopsController.createDOPS);
router.put('/dops/:id', authenticate, dopsController.updateDOPS);
router.post('/dops/:id/sign', authenticate, handleFileUpload, dopsController.signDOPS);
router.post('/dops/:formId/send', authenticate, dopsController.sendDOPSToTrainee);
router.get('/dops/:id', authenticate, dopsController.getDOPSById);
router.delete('/dops/:id', authenticate, dopsController.deleteDOPSById);


module.exports = router;
