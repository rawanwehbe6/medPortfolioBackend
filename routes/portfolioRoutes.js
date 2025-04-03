const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const auth = require('../middleware/verifyToken');

// Get complete trainee portfolio
router.get('/:traineeId', auth, portfolioController.getTraineePortfolio);

module.exports = router;