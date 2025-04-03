const auth = require('../middleware/verifyToken');
const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisor'); 

router.get('/displaytrainees/:supervisorID', async (req, res) => {
    const supervisorID = req.params.supervisorID;
    try {
        const supervisees = await supervisorController.getUsersBySupervisor(supervisorID); 
        res.json(supervisees);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message }); 
    }
});

module.exports = router;