const express = require('express');
const mortalityMorbidityController = require('../controllers/MortalityMorbidityformController.js'); 
const seminarAssessmentController = require('../controllers/SeminarAssessmentController');
const upload = require("../middleware/multerConfig");
const auth = require('../middleware/auth');
const grpa = require('../controllers/grand_round_presentation_assessment');
const cbda = require('../controllers/case-based_discussion_assessment.js');
const frp = require('../controllers/fellowResidentPerformance.js');
const journalClubController = require('../controllers/journalClubForm.js');
const miniCexController = require('../controllers/miniCexController');
const dopsController = require("../controllers/dopsController.js");
const router = express.Router();

const uploadPNG = upload.fields([
  { name: "signature", maxCount: 1 }, // Supervisor or Resident signature
]);

const handleFileUpload = (req, res, next) => {
  uploadPNG(req, res, (err) => {
    if (err) return res.status(400).json({ error: "File upload failed" });

    if (req.user.role === 2) {
      // Role 2 (Resident) must upload a signature
      if (
        !req.files ||
        !req.files.signature ||
        req.files.signature.length === 0
      ) {
        return res
          .status(400)
          .json({ error: "PNG file is required for resident" });
      }
    }
    next();
  });
};

// GRPA routes
router.post(
  "/grpacreate",
  auth("create_grpa_form"),
  uploadPNG,
  grpa.createForm
);
router.put(
  "/grpaupdate/:id",
  auth("update_grpa_form"),
  handleFileUpload,
  grpa.updateForm
);
router.get("/grpa/:id", auth("get_grpa_form_by_id"), grpa.getTupleById);
router.delete(
  "/grpa/:id",
  auth("delete_grpa_form_by_id"),
  grpa.deleteTupleById
);

// CBDA routes
router.post(
  "/cbdacreate",
  auth("create_cbda_form"),
  uploadPNG,
  cbda.createForm
);
router.put(
  "/cbdaupdate/:id",
  auth("update_cbda_form"),
  handleFileUpload,
  cbda.updateForm
);
router.get("/cbda/:id", auth("get_cbda_form_by_id"), cbda.getTupleById);
router.delete(
  "/cbda/:id",
  auth("delete_cbda_form_by_id"),
  cbda.deleteTupleById
);

// Mortality & Morbidity Review Assessment Form Routes
router.post(
  "/mortality-morbidity-create",
  auth("create_mortality_morbidity_form"),
  uploadPNG,
  mortalityMorbidityController.createMortalityMorbidityForm
);

router.put(
  "/mortality-morbidity-update/:id",
  auth("update_mortality_morbidity_form"),
  handleFileUpload,
  mortalityMorbidityController.updateMortalityMorbidityForm
);

router.get(
  "/mortality-morbidity/:id",
  auth("get_mortality_morbidity_form_by_id"),
  mortalityMorbidityController.getMortalityMorbidityFormById
);

router.delete(
  "/mortality-morbidity/:id",
  auth("delete_mortality_morbidity_form_by_id"),
  mortalityMorbidityController.deleteMortalityMorbidityForm
);

// Seminar Assessment Form Routes
router.post(
  "/seminar-assessment-create",
  auth("create_seminar_assessment"),
  uploadPNG,
  seminarAssessmentController.createSeminarAssessment
);

router.put(
  "/seminar-assessment-update/:id",
  auth("update_seminar_assessment"),
  handleFileUpload,
  seminarAssessmentController.updateSeminarAssessment
);

router.get(
  "/seminar-assessment/:id",
  auth("get_seminar_assessment_by_id"),
  seminarAssessmentController.getSeminarAssessmentById
);

router.delete(
  "/seminar-assessment/:id",
  auth("delete_seminar_assessment_by_id"),
  seminarAssessmentController.deleteSeminarAssessment
);

//fellow resident form routes
router.post(
  "/fellowresidentcreate",
  auth("create_fellow_resident_form"),
  uploadPNG,
  frp.createForm
);
router.put(
  "/fellowresidentupdate/:id",
  auth("update_fellow_resident_form"),
  uploadPNG,
  frp.updateForm
);
router.get(
  "/fellowresident/:id",
  auth("get_fellow_resident_form_by_id"),
  frp.getTupleById
);
router.delete(
  "/fellowresident/:id",
  auth("delete_fellow_resident_form_by_id"),
  frp.deleteTupleById
);

// Journal Club Assessment Routes
router.post(
  "/journalclubcreate",
  auth("create_journal_club_form"),
  uploadPNG,
  journalClubController.createForm
);
router.put(
  "/journalclubupdate/:id",
  auth("update_journal_club_form"),
  handleFileUpload,
  journalClubController.updateForm
);
router.get(
  "/journalclub/:id",
  auth("get_journal_club_form_by_id"),
  journalClubController.getTupleById
);
router.delete(
  "/journalclub/:id",
  auth("delete_journal_club_form_by_id"),
  journalClubController.deleteTupleById
);

// Mini-CEX Routes
router.post('/mini-cex', auth("create_mini_cex"), uploadPNG, miniCexController.createMiniCEX);
router.put('/mini-cex/:id', auth("update_mini_cex"), handleFileUpload, miniCexController.updateMiniCEX);
//router.post('/mini-cex/:id/sign', auth("sign_mini_cex"), handleFileUpload, miniCexController.signMiniCEX);
//router.post('/mini-cex/:formId/send', auth("send_mini_cex_to_trainee"), miniCexController.sendMiniCEXToTrainee);
router.get('/mini-cex/:id', auth("get_mini_cex_by_id"), miniCexController.getMiniCEXById);
router.delete('/mini-cex/:id', auth("delete_mini_cex_by_id"), miniCexController.deleteMiniCEXById);
router.get('/clinical/:id', auth("get_mini_cex_by_id"), miniCexController.getClinical);

// DOPS Routes
router.post('/dops', auth("create_dops"), uploadPNG, dopsController.createDOPS);
router.put('/dops/:id', auth("update_dops"), handleFileUpload, dopsController.updateDOPS);
//router.post('/dops/:id/sign', auth("sign_dops"), handleFileUpload, dopsController.signDOPS);
//router.post('/dops/:formId/send', auth("send_dops_to_trainee"), dopsController.sendDOPSToTrainee);
router.get('/dops/:id', auth("get_dops_by_id"), dopsController.getDOPSById);
router.delete('/dops/:id', auth("delete_dops_by_id"), dopsController.deleteDOPSById);


module.exports = router;
