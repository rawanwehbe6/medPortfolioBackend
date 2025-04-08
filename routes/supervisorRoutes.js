const auth = require("../middleware/auth");
const express = require('express');
const router = express.Router();
const supervisor = require('../controllers/supervisor'); 

router.post('/displaytrainees',auth("supervisor_get_trainees"), supervisor.getUsersBySupervisor);
module.exports = router;
