const auth = require("../middleware/auth");
const express = require('express');
const router = express.Router();
const supervisor = require('../controllers/supervisor'); 

router.get('/displaytrainees',auth("supervisor_get_trainees"), supervisor.getUsersBySupervisor);
router.get('/form-status/:traineeId', auth("view_form_status"), supervisor.getFormCountsByTrainee);
router.get('/form_status/supervisees', auth("view_supervisee_form_statuses"), supervisor.getFormCountsBySupervisor);
router.get('/form-sent/:traineeId',auth("view_sent_forms"),supervisor.getSentFormIdsForTrainee);
router.get('/form-completed/:traineeId',auth("view_completed_forms"),supervisor.getCompletedFormIdsForTrainee);
router.get('/draft-forms/:traineeId', auth("supervisor_view_drafts"), supervisor.getDraftFormsForTraineeBySupervisor);
router.get(
  "/user-data/:traineeId",
  auth("supervisor_view_portfolio"),
  supervisor.handleGetUserData
);
router.get(
  "/all-supervisees-sent-forms",
  auth("view_sent_forms"),
  supervisor.getAllSuperviseesSentForms
);
router.get(
  "/all-supervisees-completed-forms",
  auth("view_completed_forms"),
  supervisor.getAllSuperviseesCompletedForms
);

module.exports = router;