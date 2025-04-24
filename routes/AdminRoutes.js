const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../controllers/admin');
const router = express.Router();

router.post('/addsupervisor-superviseeRelation', auth("addSupervisorSuperviseeRelation"), admin.addSupervisorSuperviseeRelation);
router.put('/updatesupervisor-superviseeRelation', auth("updateSupervisorSuperviseeRelation"), admin.updateSupervisorSuperviseeRelation);
router.delete('/deletesupervisor-superviseeRelation', auth("deleteSupervisorSuperviseeRelation"), admin.deleteSupervisorSuperviseeRelation);
router.get('/contact-messages', auth("get_contact_messages"), admin.getAllContactMessages);
router.get('/user-counts', auth("getUserCountsByRole"), admin.getUserCountsByRole);
router.get('/educational-supervisors', auth("get_Educational_Supervisors"), admin.getEducationalSupervisors);
router.get('/clinical-supervisors-or-clinics', auth("get_Clinical_Supervisors_Or_Clinics"), admin.getClinicalSupervisorsOrClinics);
router.get('/users', auth("get_All_Users_With_Roles"), admin.getAllUsersWithRoles);
router.get('/roles', auth("get_User_Types"), admin.getAllRoles);
router.get('/functions/trainee', auth("get_role_functions"), admin.getTraineeFunctions);
router.get('/functions/admin', auth("get_role_functions"), admin.getAdminFunctions);
router.get('/functions/supervisor', auth("get_role_functions"), admin.getSupervisorFunctions);

module.exports = router;
