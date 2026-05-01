const express = require('express');
const {handleRegister, handleLogin, handleLogout, handleForgotPassword, handleResetPassword, handleGoogleAuth} = require("../controllers/authController");
const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post('/logout', handleLogout);
router.post("/forgot-password", handleForgotPassword);
router.put("/reset-password/:token", handleResetPassword);
router.post("/google", handleGoogleAuth);

module.exports = router;