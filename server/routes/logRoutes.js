const express = require("express");
const router = express.Router();
const multer = require("multer");
const restrictToLoggedInOnly = require("../middlewares/restrictToLoginOnly");
const {createLog, getLogs, getSpecificLog, editLog, deleteLog} = require("../controllers/logController.js");
const { validateBody, validateQuery, validateParams } = require("../middlewares/validateRequest");
const {
    createLogSchema,
    editLogSchema,
    getLogsQuerySchema,
    logIdParamsSchema,
} = require("../validations/logSchemas");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post("/", restrictToLoggedInOnly, upload.array('images', 3), validateBody(createLogSchema), createLog);
router.get("/", restrictToLoggedInOnly, validateQuery(getLogsQuerySchema), getLogs);
router.get("/:id", restrictToLoggedInOnly, validateParams(logIdParamsSchema), getSpecificLog);
router.put("/:id", restrictToLoggedInOnly, validateParams(logIdParamsSchema), upload.array('images', 3), validateBody(editLogSchema), editLog);
router.delete("/:id", restrictToLoggedInOnly, validateParams(logIdParamsSchema), deleteLog);

module.exports = router;     
