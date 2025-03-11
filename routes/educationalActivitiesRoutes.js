const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerConfig");
const {
    addCourse,
    updateCourse,
    deleteCourse,
    addConference,
    addWorkshop,
    updateWorkshop,
    deleteWorkshop,
  } = require("../controllers/educationalActivitiesController");const auth = require("../middleware/authMiddleware");

router.post("/addCourse", auth, upload.single('certificate'), addCourse);
router.put("/updateCourse/:id", auth, upload.single('certificate'), updateCourse);
router.delete("/deleteCourse/:id", auth, deleteCourse);
router.post("/addConference", auth, upload.single('certificate'), addConference);
router.post("/addWorkshop", auth, upload.single('certificate'), addWorkshop);
router.put("/updateWorkshop/:id", auth, upload.single('certificate'), updateWorkshop);
router.delete("/deleteWorkshop/:id", auth, deleteWorkshop);

module.exports = router;
