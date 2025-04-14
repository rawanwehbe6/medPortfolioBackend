const auth = require("../middleware/auth");
const express = require('express');
const router = express.Router();
const Trainee = require('../controllers/Trainee'); 
router.get('/sent-forms', auth("trainee_view_forms"), Trainee.getSentFormsForTrainee);

module.exports = router;
