const express = require("express");
const router = express.Router();
const upload = require('../middleware/multerConfig');
const authMiddleware = require('../middleware/authMiddleware');
const auth = require('../middleware/verifyToken.js');
const logbookController = require("../controllers/logbookController");

const uploadPNG = upload.fields([
    { name: "signature", maxCount: 1 }, // Supervisor or Resident signature
]);

// Logbook profile Routes
router.post("/logbook/profile", auth, logbookController.createLogbookProfile);
router.get("/logbook/profile", auth, logbookController.getLogbookProfileInfo);
router.put("/logbook/profile", auth, logbookController.updateLogbookProfile);
router.get("/logbook/profile-picture", auth, logbookController.getLogbookProfile);
router.delete('/logbook/profile-picture', auth, logbookController.deleteLogbookProfile);
router.delete('/logbook/profile', auth, logbookController.deleteLogbookProfileInfo);


// Logbook Certificate Routes
router.post("/logbook/certificate", auth, uploadPNG, logbookController.signLogbookCertificate);
router.post("/logbook/certificate/:trainee_id", auth, uploadPNG, logbookController.signLogbookCertificate);
router.get("/logbook/certificate/sign/:certificate_id", auth, logbookController.getCertificateSignature);
router.delete("/logbook/certificate/delete/:certificate_id",auth, logbookController.deleteLogbookCertificate);

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
module.exports = router;