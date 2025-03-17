const auth = require('../middleware/verifyToken');
const express = require('express');
const router = express.Router();
const supervisor = require('../controllers/supervisor');

router.post('/displaytrainees',auth, supervisor.getUsersBySupervisor);
module.exports = router;