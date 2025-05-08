const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../controllers/admin');
const router = express.Router();

router.post('/addsupervisor-superviseeRelation', auth("addSupervisorSuperviseeRelation"), admin.addSupervisorSuperviseeRelation);
router.put('/updatesupervisor-superviseeRelation', auth("updateSupervisorSuperviseeRelation"), admin.updateSupervisorSuperviseeRelation);
router.delete('/deletesupervisor-superviseeRelation', auth("deleteSupervisorSuperviseeRelation"), admin.deleteSupervisorSuperviseeRelation);
router.get('/contact-messages', auth("get_contact_messages"), admin.getAllContactMessages);
router.get('/user-counts', auth("getUserCountsByRole"), admin.getUserCountsByRole);

router.get("/supervisors", auth("get_Supervisors"), admin.getSupervisors);
router.get(
  "/users",
  auth("get_All_Users_With_Roles"),
  admin.getAllUsersWithRoles
);
router.get("/roles", auth("get_User_Types"), admin.getAllRoles);
router.get(
  "/functions/trainee",
  auth("assign_roles"),
  admin.getTraineeFunctions
);
router.get("/functions/admin", auth("assign_roles"), admin.getAdminFunctions);
router.get(
  "/functions/supervisor",
  auth("assign_roles"),
  admin.getSupervisorFunctions
);
router.get(
  "/trainee-supervisors",
  auth("get_Trainee_Supervisors"),
  admin.getTraineeSupervisors
);

module.exports = router;
