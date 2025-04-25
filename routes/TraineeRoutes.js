const auth = require("../middleware/auth");
const express = require('express');
const router = express.Router();
const Trainee = require('../controllers/Trainee'); 

router.get('/forms-progress', auth("trainee_view_forms"), Trainee.getFormsProgressForTrainee);
router.get('/latest-form', auth("trainee_view_forms"), Trainee.getLatestUpdatedForm);
router.get('/sent-forms', auth("trainee_view_sent_forms"), Trainee.getSentFormsForTrainee);
router.get('/completed-forms', auth("trainee_view_completed_forms"), Trainee.getCompletedFormsForTrainee);
 
module.exports = router;