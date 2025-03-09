const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerConfig");
const { addConference } = require("../controllers/educationalActivitiesController");
const auth = require("../middleware/authMiddleware");

router.post("/addConference", auth, upload.single('certificate'), addConference);

module.exports = router;
