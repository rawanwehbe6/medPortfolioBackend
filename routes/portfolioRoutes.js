const express = require("express");
const auth = require("../middleware/auth");
const portfolio = require("../controllers/portfolio");
const router = express.Router();
router.post(
  "/formbyid",
  auth("trainee-supervisor_get_forms"),
  portfolio.getFormById
);
router.post(
  "/completedforms",
  auth("trainee-supervisor_get_forms"),
  portfolio.getCompletedFormsById
);
module.exports = router;
