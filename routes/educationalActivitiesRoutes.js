const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerConfig");
const {
    addCourse,
    updateCourse,
    deleteCourse,
    addWorkshop,
    updateWorkshop,
    deleteWorkshop,
    addConference,
    updateConference,
    deleteConference,
    getCourses,
    getWorkshops,
    getConferences
  } = require("../controllers/educationalActivitiesController");
const auth = require("../middleware/authMiddleware");

router.post("/addCourse", auth, upload.single('certificate'), addCourse);
router.put("/updateCourse/:id", auth, upload.single('certificate'), updateCourse);
router.delete("/deleteCourse/:id", auth, deleteCourse);
router.post("/addWorkshop", auth, upload.single('certificate'), addWorkshop);
router.put("/updateWorkshop/:id", auth, upload.single('certificate'), updateWorkshop);
router.delete("/deleteWorkshop/:id", auth, deleteWorkshop);
router.post("/addConference", auth, upload.single('certificate'), addConference);
router.put("/updateConference/:id", auth, upload.single("certificate"), updateConference);
router.delete("/deleteConference/:id", auth, deleteConference);
router.get("/getCourses", auth, getCourses);
router.get("/getWorkshops", auth, getWorkshops);
router.get("/getConferences", auth, getConferences);
module.exports = router;
