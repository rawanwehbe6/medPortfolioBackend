const auth = require("../middleware/auth");
const express = require('express');
const router = express.Router();
const supervisor = require('../controllers/supervisor'); 

router.get('/displaytrainees',auth("supervisor_get_trainees"), supervisor.getUsersBySupervisor);
router.get('/form-status/:traineeId', auth("view_form_status"), supervisor.getFormCountsByTrainee);

module.exports = router;
