require("dotenv").config({ path: require("path").join(__dirname, "../.env") })
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const authRouter = require("./routes/authRoutes");
const logRouter = require("./routes/logRoutes");
const dashboardRouter = require("./routes/dashboardRoutes");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/logs", logRouter);
app.use("/api/dashboard", dashboardRouter);
app.use(errorHandler);

app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.listen(3000, () => {
  console.log("App Listening on port 3000");
  mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/devjrnl")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));
});
