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
const dopsController = require('../controllers/dopsController.js'); 

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


// Mortality & Morbidity Review Assessment Form Routes
router.post('/mortality-morbidity',auth,uploadPNG,
  mortalityMorbidityController.createMortalityMorbidityForm);

router.put('/mortality-morbidity/:id',auth,handleFileUpload,
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
router.post('/seminar-assessment',auth,uploadPNG,
  seminarAssessmentController.createSeminarAssessment);

router.put('/seminar-assessment/:id',auth,handleFileUpload,
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
router.post("/fellow-resident/save-draft", auth, upload.single("signature"), frp.saveAsDraft);
router.put("/fellow-resident/update/:id", auth, upload.single("signature"), frp.updateForm);
router.post("/fellow-resident/submit/:id", auth, upload.single("signature"), frp.submitForm);
router.get("/fellow-resident/:id", auth, frp.getTupleById);
router.delete("/fellow-resident/:id", auth, frp.deleteTupleById);

// Journal Club Assessment Routes
router.post("/journal-club/create",auth, upload.fields([
  { name: "resident_signature", maxCount: 1 },
  { name: "assessor_signature", maxCount: 1 }
]), journalClubController.createAssessment);

router.put("/journal-club/update/:id",auth, upload.fields([
  { name: "resident_signature", maxCount: 1 },
  { name: "assessor_signature", maxCount: 1 }
]), journalClubController.updateAssessment);
router.get('/journal-club/:id', auth, journalClubController.getAssessmentById);
router.delete('/journal-club/:id', auth, journalClubController.deleteAssessmentById);



// Mini-CEX Routes
router.post('/mini-cex', auth, uploadPNG, miniCexController.createMiniCEX);
router.put('/mini-cex/:id', auth,  miniCexController.updateMiniCEX);
router.post('/mini-cex/:id/sign', auth, handleFileUpload, miniCexController.signMiniCEX);
router.post('/mini-cex/:formId/send', auth, miniCexController.sendMiniCEXToTrainee);
router.get('/mini-cex/:id', auth, miniCexController.getMiniCEXById);
router.delete('/mini-cex/:id', auth, miniCexController.deleteMiniCEXById);


// DOPS Routes
router.post('/dops', auth, uploadPNG, dopsController.createDOPS);
router.put('/dops/:id', auth, dopsController.updateDOPS);
router.post('/dops/:id/sign', auth, handleFileUpload, dopsController.signDOPS);
router.post('/dops/:formId/send', auth, dopsController.sendDOPSToTrainee);
router.get('/dops/:id', auth, dopsController.getDOPSById);
router.delete('/dops/:id', auth, dopsController.deleteDOPSById);


module.exports = router;
