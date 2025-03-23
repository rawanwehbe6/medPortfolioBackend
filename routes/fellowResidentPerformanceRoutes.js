const express = require('express');
const frp = require('../controllers/fellowResidentPerformance.js'); // Import the controller
const auth = require('../middleware/verifyToken.js'); // Import authentication middleware

const router = express.Router();

// Routes for Fellow Resident Performance Evaluation Form
router.post('/fellow-eval', auth, frp.createForm);
router.put('/fellow-eval/:id', auth, frp.updateForm);
router.get('/fellow-eval/:id', auth, frp.getTupleById);
router.delete('/fellow-eval/:id', auth, frp.deleteTupleById);

module.exports = router;
