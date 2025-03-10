const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerConfig");
const {addCourse, updateCourse, deleteCourse, addConference} = require("../controllers/educationalActivitiesController");
const auth = require("../middleware/authMiddleware");

router.post("/addCourse", auth, upload.single('certificate'), addCourse);
router.put("/updateCourse/:id", auth, upload.single('certificate'), updateCourse);
router.delete("/deleteCourse/:id", auth, deleteCourse);
router.post("/addConference", auth, upload.single('certificate'), addConference);

module.exports = router;
