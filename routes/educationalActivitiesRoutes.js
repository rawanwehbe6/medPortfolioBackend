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
const authenticate = require("../middleware/authMiddleware");
const auth = require("../middleware/auth");

router.post("/addCourse", auth("trainee_add_course"), upload.single('certificate'), addCourse);
router.put("/updateCourse/:id", authenticate, upload.single('certificate'), updateCourse);
router.delete("/deleteCourse/:id", authenticate, deleteCourse);
router.post("/addWorkshop", authenticate, upload.single('certificate'), addWorkshop);
router.put("/updateWorkshop/:id", authenticate, upload.single('certificate'), updateWorkshop);
router.delete("/deleteWorkshop/:id", authenticate, deleteWorkshop);
router.post("/addConference", authenticate, upload.single('certificate'), addConference);
router.put("/updateConference/:id", authenticate, upload.single("certificate"), updateConference);
router.delete("/deleteConference/:id", authenticate, deleteConference);
router.get("/getCourses", authenticate, getCourses);
router.get("/getWorkshops", authenticate, getWorkshops);
router.get("/getConferences", authenticate, getConferences);
module.exports = router;