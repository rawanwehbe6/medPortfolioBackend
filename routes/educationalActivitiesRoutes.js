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
const auth = require("../middleware/auth");

router.post("/addCourse", auth("trainee_add_course"), upload.single('certificate'), addCourse);
router.put("/updateCourse/:id", auth("trainee_update_course"), upload.single('certificate'), updateCourse);
router.delete("/deleteCourse/:id", auth("trainee_delete_course"), deleteCourse);
router.post("/addWorkshop", auth("trainee_add_workshop"), upload.single('certificate'), addWorkshop);
router.put("/updateWorkshop/:id", auth("trainee_update_workshop"), upload.single('certificate'), updateWorkshop);
router.delete("/deleteWorkshop/:id", auth("trainee_delete_workshop"), deleteWorkshop);
router.post("/addConference", auth("add_conference"), upload.single('certificate'), addConference);
router.put("/updateConference/:id", auth("update_conference"), upload.single("certificate"), updateConference);
router.delete("/deleteConference/:id", auth("delete_conference"), deleteConference);
router.get("/getCourses", auth("getCourses"), getCourses);
router.get("/getWorkshops", auth("getWorkshops"), getWorkshops);
router.get("/getConferences", auth("get_conference"), getConferences);
module.exports = router;