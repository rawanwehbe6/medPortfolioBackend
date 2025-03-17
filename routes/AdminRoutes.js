const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../controllers/admin');
const router = express.Router();

router.post('/addsupervisor-superviseeRelation', auth("addSupervisorSuperviseeRelation"), admin.addSupervisorSuperviseeRelation);
router.put('/updatesupervisor-superviseeRelation', auth("updateSupervisorSuperviseeRelation"), admin.updateSupervisorSuperviseeRelation);
router.delete('/deletesupervisor-superviseeRelation', auth("deleteSupervisorSuperviseeRelation"), admin.deleteSupervisorSuperviseeRelation);

module.exports = router;
