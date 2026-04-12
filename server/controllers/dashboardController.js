const AppError = require("../utils/appError");
const User = require("../Models/user");
const Log = require("../Models/log");

const handleDashboard = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('logs');

        let dateAWeekAgo = new Date();
        dateAWeekAgo.setDate(dateAWeekAgo.getDate() - 7);

        const sortedLogs = user.logs.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentLogs = sortedLogs.slice(0, 3); // 3 most recent

        const dashboardItems = {
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            totalLogs: user.logs.length,
            logsThisWeek: user.logs.filter((log) => new Date(log.date) > dateAWeekAgo).length,
            recentLogs,
        };

        res.status(200).json(dashboardItems);
    } catch (err) {
        next(err);
    }
}

module.exports = { handleDashboard };