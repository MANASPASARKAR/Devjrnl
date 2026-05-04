const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config({ path: path.join(__dirname, ".env"), override: true });

const authRouter = require("./routes/authRoutes");
const logRouter = require("./routes/logRoutes");
const dashboardRouter = require("./routes/dashboardRoutes");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 3000;
// const clientDistPath = path.join(__dirname, "../client/dist");
const cors = require("cors")

app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://your-vercel-app.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/logs", logRouter);
app.use("/api/dashboard", dashboardRouter);
app.use(errorHandler);
// app.use(express.static(clientDistPath));

// app.get("/{*path}", (req, res) => {
//   res.sendFile(path.join(clientDistPath, "index.html"));
// });
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running"
  });
});

app.listen(port, () => {
  console.log(`App Listening on port ${port}`);
  mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/devjrnl")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));
});
