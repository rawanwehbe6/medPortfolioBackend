const express = require("express");
const router = express.Router();
const upload = require('../middleware/multerConfig');
const authMiddleware = require('../middleware/authMiddleware');
const auth = require('../middleware/auth');
const logbookController = require("../controllers/logbookController");
const academicsAController = require("../controllers/academicsA");
const seminarController = require("../controllers/academicsB");
const teachingController = require("../controllers/teaching");
const researchpublicationsController = require("../controllers/researchPublications");
const departmentalActivities = require("../controllers/departmentalActivities");
const miscellaneousActivities = require("../controllers/miscellaneous");

const uploadPNG = upload.fields([
    { name: "signature", maxCount: 1 }, // Supervisor or Resident signature
]);

// Logbook profile Routes
router.post("/logbook/profile", auth("create_logbook_profile"), logbookController.createLogbookProfile);
router.get("/logbook/profile/:traineeId", auth("get_logbook_profile_info"), logbookController.getLogbookProfileInfo);
router.put("/logbook/profile", auth("update_logbook_profile"), logbookController.updateLogbookProfile);
router.get("/logbook/profile-picture", auth("get_logbook_profile"), logbookController.getLogbookProfile);
router.delete('/logbook/profile-picture', auth("get_logbook_profile"), logbookController.deleteLogbookProfile);
router.delete('/logbook/profile', auth("delete_logbook_profile"), logbookController.deleteLogbookProfileInfo);



// Logbook Certificate Routes
router.post("/logbook/certificate", auth("sign_logbook_certificate"), uploadPNG, logbookController.signLogbookCertificate);
router.post("/logbook/certificate/:trainee_id", auth("sign_logbook_certificate"), uploadPNG, logbookController.signLogbookCertificate);
router.get("/logbook/certificate/sign/:certificate_id", auth("get_certificate_signature"), logbookController.getCertificateSignature);
router.delete("/logbook/certificate/delete/:certificate_id",auth("delete_logbook_certificate"), logbookController.deleteLogbookCertificate);

// Logbook First Year Rotation Config Routes
router.post('/logbook/first-year-rotation-config', auth, logbookController.createRotation1stYearConfig);
router.put('/logbook/first-year-rotation-config/:id', auth, logbookController.updateRotation1stYearConfig);
router.get('/logbook/first-year-rotation-config/:id', auth, logbookController.getRotation1stYearConfig)
router.delete('/logbook/first-year-rotation-config/:id', auth, logbookController.deleteRotation1stYearConfig);

// Logbook First Year Rotation Details Routes
router.post('/logbook/first-year-rotation-logbook', auth, logbookController.createFirstYearRotationDetails);
router.put('/logbook/first-year-rotation-logbook/:rotation_id', auth, logbookController.updateFirstYearRotationDetails);
router.get('/logbook/first-year-rotation-logbook/:rotation_id', auth, logbookController.getFirstYearRotationDetailsById);
router.delete('/logbook/first-year-rotation-logbook/:rotation_id', auth, logbookController.deleteFirstYearRotationDetails);

// Logbook Second Year Rotation Config Routes
router.post('/logbook/second-year-rotation-config', auth, logbookController.createRotation2ndYearConfig);
router.put('/logbook/second-year-rotation-config/:id', auth, logbookController.updateRotation2ndYearConfig);
router.get('/logbook/second-year-rotation-config/:id', auth, logbookController.getRotation2ndYearConfig)
router.delete('/logbook/second-year-rotation-config/:id', auth, logbookController.deleteRotation2ndYearConfig);

// Logbook Second Year Rotation Details Routes
router.post('/logbook/second-year-rotation-logbook', auth, logbookController.createSecondYearRotationDetails);
router.put('/logbook/second-year-rotation-logbook/:rotation_id', auth, logbookController.updateSecondYearRotationDetails);
router.get('/logbook/second-year-rotation-logbook/:rotation_id', auth, logbookController.getSecondYearRotationDetailsById);
router.delete('/logbook/second-year-rotation-logbook/:rotation_id', auth, logbookController.deleteSecondYearRotationDetails);

// Logbook Third Year Rotation Config Routes
router.post('/logbook/third-year-rotation-config', auth, logbookController.createRotation3rdYearConfig);
router.put('/logbook/third-year-rotation-config/:id', auth, logbookController.updateRotation3rdYearConfig);
router.get('/logbook/third-year-rotation-config/:id', auth, logbookController.getRotation3rdYearConfig)
router.delete('/logbook/third-year-rotation-config/:id', auth, logbookController.deleteRotation3rdYearConfig);

// Logbook Third Year Rotation Details Routes
router.post('/logbook/third-year-rotation-logbook', auth, logbookController.createThirdYearRotationDetails);
router.put('/logbook/third-year-rotation-logbook/:rotation_id', auth, logbookController.updateThirdYearRotationDetails);
router.get('/logbook/third-year-rotation-logbook/:rotation_id', auth, logbookController.getThirdYearRotationDetailsById);
router.delete('/logbook/third-year-rotation-logbook/:rotation_id', auth, logbookController.deleteThirdYearRotationDetails);

// Logbook Procedure Logs Routes
router.post('/logbook/procedure-logs/:procedure_name', auth, logbookController.createOrUpdateSingleProcedureLog);
//router.put('/logbook/procedure-logs', auth, logbookController.updateProcedureLogs);
router.get('/logbook/procedure-logs/:trainee_id', auth, logbookController.getProcedureLogs);
router.delete('/logbook/procedure-logs/:procedure_name', auth, logbookController.deleteProcedureLog);

// Logbook Procedure Summary Routes
router.post('/logbook/procedure-summary', auth, logbookController.addProcedureSummary);
router.get("/logbook/procedure-summary", auth, logbookController.getProcedureSummaries);
router.put("/logbook/procedure-summary/:id", auth, logbookController.updateProcedureSummary);
router.delete("/logbook/procedure-summary/:id", auth, logbookController.deleteProcedureSummary);

// Case Presentation Routes
router.post("/case-presentations", auth, academicsAController.createCasePresentation);
router.get("/case-presentations", auth, academicsAController.getCasePresentations);
router.delete("/case-presentations/:id", auth, academicsAController.deleteCasePresentation);
router.put("/case-presentations/sign/:id", auth, uploadPNG, academicsAController.signModerator);

// Case seminar Routes
router.post("/seminars", auth, seminarController.createSeminar);
router.get("/seminars", auth, seminarController.getSeminars);
router.delete("/seminars/:id", auth, seminarController.deleteSeminar);
router.put("/seminars/sign/:id", auth, uploadPNG, seminarController.signModerator);

//teaching routes
router.post("/teaching", auth('create_teachings'), teachingController.createTeaching);
router.get("/teaching",auth('get_teachings'),  teachingController.getTeachings);
router.delete("/teaching/:id",auth('delete_teachings'), teachingController.deleteTeaching);
router.put(
  "/teaching/:id/sign",
  auth("update_teachings"),
  teachingController.signFaculty
);

//research publications routes
router.post("/research-publications",auth('create_researchPub'), researchpublicationsController.createResearchEntry);
router.get("/research-publications",auth('get_researchPub'), researchpublicationsController.getResearchEntries);
router.delete("/research-publications/:id", auth("delete_researchPub"),researchpublicationsController.deleteResearchEntry);
router.put(
  "/research-publications/:id/sign",
  auth("update_researchPub"),
  researchpublicationsController.signFaculty
);

//departmental activities routes
router.post("/departmental-Activities",auth('create_depActivities'), departmentalActivities.createActivityEntry);
router.get("/departmental-Activities",auth('get_depActivities'), departmentalActivities.getActivityEntries);
router.delete("/departmental-Activities/:id",auth('delete_depActivities'), departmentalActivities.deleteActivityEntry);
router.put(
  "/departmental-Activities/:id/sign",
  auth("update_depActivities"),
  departmentalActivities.signActivityFaculty
);

//miscellaneous activities routes
router.post("/miscellaneous-Activities", miscellaneousActivities.createMiscActivity);
router.get("/miscellaneous-Activities", miscellaneousActivities.getAllMiscActivities);
router.delete("/miscellaneous-Activities/:id", miscellaneousActivities.deleteMiscActivity);
router.put(
  "/miscellaneous-Activities/:id/sign",
  upload.fields([{ name: "signature", maxCount: 1 }]),
  miscellaneousActivities.signMiscActivityFaculty
);
router.get("/miscellaneous-Activities/:id", miscellaneousActivities.getMiscActivityById);
module.exports = router;