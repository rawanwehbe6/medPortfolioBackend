// // routes/surgicalExperienceRoutes.js
// const express = require('express');
// const router = express.Router();
// const { createSurgicalExperience, updateSurgicalExperience, deleteSurgicalExperience, getAllSurgicalExperiences } = require('../controllers/surgicalExperienceController');
// const { checkTraineeRole } = require('../middleware/authMiddleware');

// // Route for creating a new surgical experience
// router.post('/', (req, res) => {
//     res.send('Test successful!');
//   });

// // Route for updating an existing surgical experience
// router.put('/:id', checkTraineeRole, updateSurgicalExperience);

// // Route for deleting a surgical experience
// router.delete('/:id', checkTraineeRole, deleteSurgicalExperience);

// // Route for getting all surgical experiences for the user
// router.get('/', checkTraineeRole, getAllSurgicalExperiences);

// module.exports = router;
