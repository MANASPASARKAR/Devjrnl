const User = require("../Models/user");
const hashPass  = require("../service/hashPass");
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
    res.status(201).json({ message: 'Account created', username: user.username })
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
    const user = isEmail? await User.findOne({ email: identifier }) : await User.findOne({username: identifier});

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
    res.status(200).json({ message: 'Login successful', username: user.username})
  } catch (err) {
    next(err);
  }
};

module.exports = { handleLogin, handleRegister };
