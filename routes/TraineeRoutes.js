const auth = require("../middleware/auth");
const express = require('express');
const router = express.Router();
const Trainee = require('../controllers/Trainee'); 

router.get('/forms-progress', auth("trainee_view_forms"), Trainee.getFormsProgressForTrainee);

module.exports = router;