const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../controllers/admin');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

router.post('/addsupervisor-superviseeRelation', auth("addSupervisorSuperviseeRelation"), admin.addSupervisorSuperviseeRelation);
router.put('/updatesupervisor-superviseeRelation', auth("updateSupervisorSuperviseeRelation"), admin.updateSupervisorSuperviseeRelation);
router.delete('/deletesupervisor-superviseeRelation', auth("deleteSupervisorSuperviseeRelation"), admin.deleteSupervisorSuperviseeRelation);
router.get('/contact-messages', verifyToken, admin.getAllContactMessages);
router.get('/user-counts', verifyToken, admin.getUserCountsByRole);

module.exports = router;
