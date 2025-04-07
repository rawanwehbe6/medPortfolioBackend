const express = require("express");
const router = express.Router();
const upload = require('../middleware/multerConfig');
const authMiddleware = require('../middleware/authMiddleware');
const auth = require('../middleware/verifyToken.js');
const logbookController = require("../controllers/logbookController");
const {
    createCasePresentation,
    deleteCasePresentation,
    getCasePresentations,
    signModerator
  } = require("../controllers/casePresentationController");
  

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

// Case Presentation Routes
router.post("/case-presentations", auth, createCasePresentation);
router.get("/case-presentations", auth, getCasePresentations);
router.delete("/case-presentations/:id", auth, deleteCasePresentation);
router.put("/case-presentations/sign/:id", auth, uploadPNG, signModerator);

module.exports = router;