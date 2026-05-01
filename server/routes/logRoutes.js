const express = require("express");
const router = express.Router();
const multer = require("multer");
const restrictToLoggedInOnly = require("../middlewares/restrictToLoginOnly");
const {createLog, getLogs, getSpecificLog, editLog, deleteLog} = require("../controllers/logController.js");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post("/", restrictToLoggedInOnly, upload.array('images', 3), createLog);
router.get("/", restrictToLoggedInOnly, getLogs);
router.get("/:id", restrictToLoggedInOnly, getSpecificLog);
router.put("/:id", restrictToLoggedInOnly, upload.array('images', 3), editLog);
router.delete("/:id", restrictToLoggedInOnly, deleteLog);

module.exports = router;     