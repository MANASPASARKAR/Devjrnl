const express = require('express');
const {handleRegister, handleLogin, handleLogout, handleForgotPassword, handleResetPassword, handleGoogleAuth} = require("../controllers/authController");
const { validateBody, validateParams } = require("../middlewares/validateRequest");
const {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordParamsSchema,
    resetPasswordSchema,
    googleAuthSchema,
} = require("../validations/authSchemas");
const router = express.Router();

router.post("/register", validateBody(registerSchema), handleRegister);
router.post("/login", validateBody(loginSchema), handleLogin);
router.post('/logout', handleLogout);
router.post("/forgot-password", validateBody(forgotPasswordSchema), handleForgotPassword);
router.put("/reset-password/:token", validateParams(resetPasswordParamsSchema), validateBody(resetPasswordSchema), handleResetPassword);
router.post("/google", validateBody(googleAuthSchema), handleGoogleAuth);

module.exports = router;
