const express = require("express");
const router = express.Router();
const upload = require('../middleware/multerConfig');
const authMiddleware = require('../middleware/authMiddleware');
const auth = require('../middleware/verifyToken.js');
const logbookController = require("../controllers/logbookController");
const academicsAController = require("../controllers/academicsA");
const seminarController = require("../controllers/academicsB");
const teachingController = require("../controllers/teaching");

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
router.post("/teaching", teachingController.createTeaching);
router.get("/teaching", teachingController.getTeachings);
router.delete("/teaching/:id", authenticate, teachingController.deleteTeaching);
router.put("/teaching/:id/sign", upload.fields([{ name: "signature", maxCount: 1 }]), teachingController.signFaculty);

module.exports = router;