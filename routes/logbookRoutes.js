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
router.post('/logbook/first-year-rotation-config', auth("create_rotation_1st_year_config"), logbookController.createRotation1stYearConfig);
router.put('/logbook/first-year-rotation-config/:id', auth("update_rotation_1st_year_config"), logbookController.updateRotation1stYearConfig);
router.get('/logbook/first-year-rotation-config/:trainee_id', auth("get_rotation_1st_year_config"), logbookController.getRotation1stYearConfig)
router.delete('/logbook/first-year-rotation-config/:id', auth("delete_rotation_1st_year_config"), logbookController.deleteRotation1stYearConfig);

// Logbook First Year Rotation Details Routes
router.post('/logbook/first-year-rotation-logbook', auth("create_first_year_rotation_details"), logbookController.createFirstYearRotationDetails);
router.put('/logbook/first-year-rotation-logbook/:rotation_id', auth("update_first_year_rotation_details"), logbookController.updateFirstYearRotationDetails);
router.get('/logbook/first-year-rotation-logbook/:rotation_id', auth("get_first_year_rotation_details"), logbookController.getFirstYearRotationDetailsById);
router.delete('/logbook/first-year-rotation-logbook/:rotation_id', auth("delete_first_year_rotation_details"), logbookController.deleteFirstYearRotationDetails);

// Logbook Second Year Rotation Config Routes
router.post('/logbook/second-year-rotation-config', auth("create_rotation_2nd_year_config"), logbookController.createRotation2ndYearConfig);
router.put('/logbook/second-year-rotation-config/:id', auth("update_rotation_2nd_year_config"), logbookController.updateRotation2ndYearConfig);
router.get('/logbook/second-year-rotation-config/:trainee_id', auth("get_rotation_2nd_year_config"), logbookController.getRotation2ndYearConfig)
router.delete('/logbook/second-year-rotation-config/:id', auth("delete_rotation_2nd_year_config"), logbookController.deleteRotation2ndYearConfig);

// Logbook Second Year Rotation Details Routes
router.post('/logbook/second-year-rotation-logbook', auth("create_second_year_rotation_details"), logbookController.createSecondYearRotationDetails);
router.put('/logbook/second-year-rotation-logbook/:rotation_id', auth("update_second_year_rotation_details"), logbookController.updateSecondYearRotationDetails);
router.get('/logbook/second-year-rotation-logbook/:rotation_id', auth("get_second_year_rotation_details"), logbookController.getSecondYearRotationDetailsById);
router.delete('/logbook/second-year-rotation-logbook/:rotation_id', auth("delete_second_year_rotation_details"), logbookController.deleteSecondYearRotationDetails);

// Logbook Third Year Rotation Config Routes
router.post('/logbook/third-year-rotation-config', auth("create_rotation_3rd_year_config"), logbookController.createRotation3rdYearConfig);
router.put('/logbook/third-year-rotation-config/:id', auth("update_rotation_3rd_year_config"), logbookController.updateRotation3rdYearConfig);
router.get('/logbook/third-year-rotation-config/:trainee_id', auth("get_rotation_3rd_year_config"), logbookController.getRotation3rdYearConfig)
router.delete('/logbook/third-year-rotation-config/:id', auth("delete_rotation_3rd_year_config"), logbookController.deleteRotation3rdYearConfig);

// Logbook Third Year Rotation Details Routes
router.post('/logbook/third-year-rotation-logbook', auth("create_third_year_rotation_details"), logbookController.createThirdYearRotationDetails);
router.put('/logbook/third-year-rotation-logbook/:rotation_id', auth("update_third_year_rotation_details"), logbookController.updateThirdYearRotationDetails);
router.get('/logbook/third-year-rotation-logbook/:trainee_id', auth("get_third_year_rotation_details"), logbookController.getThirdYearRotationDetailsById);
router.delete('/logbook/third-year-rotation-logbook/:rotation_id', auth("delete_third_year_rotation_details"), logbookController.deleteThirdYearRotationDetails);

// Logbook Procedure Logs Routes
router.post('/logbook/procedure-logs/:procedure_name', auth("create_or_update_single_procedure_log"), logbookController.createOrUpdateSingleProcedureLog);
//router.put('/logbook/procedure-logs', auth, logbookController.updateProcedureLogs);
router.get('/logbook/procedure-logs/:trainee_id', auth("get_procedure_logs"), logbookController.getProcedureLogs);
router.delete('/logbook/procedure-logs/:procedure_name', auth("delete_procedure_logs"), logbookController.deleteProcedureLog);

// Logbook Procedure Summary Routes
router.post('/logbook/procedure-summary', auth("add_procedure_summary"), logbookController.addProcedureSummary);
router.get("/logbook/procedure-summary/:traineeId", auth("get_procedure_summaries"), logbookController.getProcedureSummaries);
router.put("/logbook/procedure-summary/:id", auth("update_procedure_summary"), logbookController.updateProcedureSummary);
router.delete("/logbook/procedure-summary/:id", auth("delete_procedure_summary"), logbookController.deleteProcedureSummary);

// Case Presentation Routes
router.post("/case-presentations", auth('create_case_presentation'), academicsAController.createCasePresentation);
router.get("/case-presentations", auth('get_case_presentation'), academicsAController.getCasePresentations);
router.delete("/case-presentations/:id", auth('delete_case_presentation'), academicsAController.deleteCasePresentation);
router.put(
  "/case-presentations/:id/sign",
  auth("sign_case_presentation"),
  academicsAController.signModerator
);
router.put("/case-presentations/:id", auth("update_case_presentation"), academicsAController.updateCasePresentation);

// Case seminar Routes
router.post("/seminars", auth('create_seminars'), seminarController.createSeminar);
router.get("/seminars", auth('get_seminars'), seminarController.getSeminars);
router.delete("/seminars/:id", auth('delete_seminars'), seminarController.deleteSeminar);
router.put(
  "/seminars/sign/:id",
  auth("sign_seminars"),
  seminarController.signModerator
);
router.put("/seminars/:id", auth("update_seminars"), seminarController.updateSeminar);

//teaching routes
router.post("/teaching", auth('create_teachings'), teachingController.createTeaching);
router.get("/teaching",auth('get_teachings'),  teachingController.getTeachings);
router.delete("/teaching/:id",auth('delete_teachings'), teachingController.deleteTeaching);
router.put(
  "/teaching/:id/sign",
  auth("sign_teachings"),
  teachingController.signFaculty
);
router.put("/teaching/:id", auth("update_teachings"), teachingController.updateTeaching);

//research publications routes
router.post("/research-publications",auth('create_researchPub'), researchpublicationsController.createResearchEntry);
router.get("/research-publications",auth('get_researchPub'), researchpublicationsController.getResearchEntries);
router.delete("/research-publications/:id", auth("delete_researchPub"),researchpublicationsController.deleteResearchEntry);
router.put(
  "/research-publications/:id/sign",
  auth("sign_researchPub"),
  researchpublicationsController.signFaculty
);
router.put("/research-publications/:id", auth("update_researchPub"), researchpublicationsController.updateResearchEntry);

//departmental activities routes
router.post("/departmental-Activities",auth('create_depActivities'), departmentalActivities.createActivityEntry);
router.get("/departmental-Activities",auth('get_depActivities'), departmentalActivities.getActivityEntries);
router.delete("/departmental-Activities/:id",auth('delete_depActivities'), departmentalActivities.deleteActivityEntry);
router.put(
  "/departmental-Activities/:id/sign",
  auth("sign_depActivities"),
  departmentalActivities.signActivityFaculty
);
router.put("/departmental-Activities/:id", auth("update_depActivities"), departmentalActivities.updateActivityEntry);

//miscellaneous activities routes
router.post("/miscellaneous-Activities",auth('create_miscellaneous-Activities'), miscellaneousActivities.createMiscActivity);
router.get("/miscellaneous-Activities",auth('get_miscellaneous-Activities'), miscellaneousActivities.getAllMiscActivities);
router.delete("/miscellaneous-Activities/:id",auth('delete_miscellaneous-Activities'), miscellaneousActivities.deleteMiscActivity);
router.put(
  "/miscellaneous-Activities/:id/sign",
  auth("sign_miscellaneous-Activities"),
  miscellaneousActivities.signMiscActivityFaculty
);
router.get("/miscellaneous-Activities/:id", auth('get_miscellaneous-ActivitiesByID'),miscellaneousActivities.getMiscActivityById);
router.put("/miscellaneous-Activities/:id", auth("update_miscellaneous-Activities"), miscellaneousActivities.updateMiscActivity);

module.exports = router;