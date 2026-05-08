const mongoose = require("mongoose");

const weeklyReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  weekStart: {
    type: Date,
    required: true,
  },
  summaryText: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
  },
  periodStart: {
    type: Date,    // exact start of the log window used for this report
  },
  shareToken: {
    type: String,
  },
});

const WeeklyReport = mongoose.model("WeeklyReport", weeklyReportSchema);
module.exports = WeeklyReport;
