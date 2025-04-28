const express = require("express");
const auth = require("../middleware/auth");
const portfolio = require("../controllers/portfolio");
const router = express.Router();
router.get(
  "/formbyid",
  auth("trainee-supervisor_get_forms"),
  portfolio.getFormById
);
router.get(
  "/completedforms",
  auth("trainee-supervisor_get_forms"),
  portfolio.getCompletedFormsById
);
module.exports = router;
