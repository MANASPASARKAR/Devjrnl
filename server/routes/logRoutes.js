const express = require("express");
const router = express.Router();
const restrictToLoggedInOnly = require("../middlewares/restrictToLoginOnly")
const {createLog, getLogs, getSpecificLog, editLog, deleteLog} = require("../controllers/logController.js");

router.post("/", restrictToLoggedInOnly, createLog);
router.get("/", restrictToLoggedInOnly, getLogs);
router.get("/:id", restrictToLoggedInOnly, getSpecificLog);
router.put("/:id", restrictToLoggedInOnly, editLog);
router.delete("/:id", restrictToLoggedInOnly, deleteLog);

module.exports = router;     