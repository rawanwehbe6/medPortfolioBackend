const express = require("express");
const auth = require("../middleware/auth");
const portfolio = require("../controllers/portfolio");
const router = express.Router();
router.get(
  "/formbyid",
  auth("trainee-supervisor_get_forms"),
  portfolio.getFormById
);
module.exports = router;
