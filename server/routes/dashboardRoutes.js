const express = require("express");
const router = express.Router();
const restrictToLoggedInOnly = require("../middlewares/restrictToLoginOnly")
const { handleDashboard } = require("../controllers/dashboardController")

router.get("/", restrictToLoggedInOnly, handleDashboard);

module.exports = router;