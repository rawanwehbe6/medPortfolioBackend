const express = require("express");
const router = express.Router();
const upload = require('../middleware/multerConfig');
const authMiddleware = require('../middleware/authMiddleware');
const auth = require('../middleware/verifyToken.js');
const logbookController = require("../controllers/logbookController");

// Logbook profile Routes
router.post("/logbook/profile", auth, logbookController.createLogbookProfile);
router.get("/logbook/profile", auth, logbookController.getLogbookProfileInfo);
router.put("/logbook/profile", auth, logbookController.updateLogbookProfile);
router.get("/logbook/profile-picture", auth, logbookController.getLogbookProfile);



module.exports = router;