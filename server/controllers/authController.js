const User = require("../Models/user");
const hashPass = require("../service/hashPass");
const { setUser } = require("../service/authService");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/appError");

const handleRegister = async (req, res, next) => {
  try {
    let { name, username, email, password } = req.body;

    if (!email || !password) {
      throw new AppError("email and password are required", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("invalid email address", 400);
    }

    if (password.length < 8) {
      throw new AppError("password must be at least 8 characters", 400);
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new AppError("email already used", 400);
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new AppError("username already used", 400);
    }

    let passwordHash = await hashPass(password);
    const newUser = new User({ name, username, email, passwordHash });
    await newUser.save();
    const token = setUser(newUser);

    if (!token) {
      throw new AppError("failed to create authentication token", 500);
    }
    res.cookie("uid", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ message: 'Account created', username: username })
  } catch (err) {
    next(err);
  }
};

const handleLogin = async (req, res, next) => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let { identifier, password } = req.body;
    if (!identifier || !password) {
      throw new AppError("email/username and password are required", 400);
    }

    const isEmail = emailRegex.test(identifier);
    const user = isEmail ? await User.findOne({ email: identifier }) : await User.findOne({ username: identifier });

    if (!user) {
      throw new AppError("incorrect email/username or password", 401);
      // redirect to signup
    }

    let passwordComparison = await bcrypt.compare(password, user.passwordHash);
    if (!passwordComparison) {
      throw new AppError("incorrect email/username or password", 401);
    }
    const token = setUser(user);
    if (!token) {
      throw new AppError("failed to create authentication token", 500);
    }

    res.cookie("uid", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: 'Login successful', username: user.username })
  } catch (err) {
    next(err);
  }
};

const handleLogout = async (req, res, next) => {
  try {
    res.clearCookie("uid", {
      httpOnly: true,
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production',


    })
    res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}


const crypto = require("crypto");
const sendEmail = require("../service/emailService");

const handleForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("There is no user with that email address", 404);
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire time (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Create reset url
    const resetUrl = `${process.env.APP_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: monospace; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #e5e7eb; padding: 40px; border: 1px solid #1f1f1f;">
        <h1 style="color: #A8FF3E; letter-spacing: 0.1em; font-weight: 900; margin-bottom: 24px; text-transform: uppercase;">
          DEVJRNL // Reset Password
        </h1>
        <p style="font-size: 14px; margin-bottom: 24px;">
          You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to:
        </p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #39ff14; color: #0f2000; text-decoration: none; padding: 12px 24px; font-weight: 900; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 24px;">
          RESET_PASSWORD
        </a>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1f1f1f;">
          If you did not request this, please ignore this email and your password will remain unchanged.
        </p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "DEVJRNL_ Password Reset Token",
        message,
      });

      res.status(200).json({ message: "Email sent successfully" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError("Email could not be sent", 500);
    }
  } catch (err) {
    next(err);
  }
};

const handleResetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      throw new AppError("Password must be at least 8 characters", 400);
    }

    // Hash URL token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError("Invalid or expired token", 400);
    }

    // Set new password
    user.passwordHash = await hashPass(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const handleGoogleAuth = async (req, res, next) => {
  try {
    const { token, access_token } = req.body;
    if (!token && !access_token) throw new AppError("Token is required", 400);

    let email, name, googleId;

    if (access_token) {
        const axios = require('axios');
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        email = response.data.email;
        name = response.data.name;
        googleId = response.data.sub;
    } else {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
        googleId = payload.sub;
    }

    let user = await User.findOne({ email });

    if (!user) {
      let baseUsername = email.split('@')[0];
      let username = baseUsername;
      let counter = 1;
      
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = new User({ email, name, username, googleId });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const authToken = setUser(user);
    if (!authToken) throw new AppError("Failed to create authentication token", 500);

    res.cookie("uid", authToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: 'Google Auth successful', username: user.username });
  } catch (err) {
    next(err);
  }
};

module.exports = { handleLogin, handleRegister, handleLogout, handleForgotPassword, handleResetPassword, handleGoogleAuth };
