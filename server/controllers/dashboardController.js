const AppError = require("../utils/appError");
const User = require("../Models/user");
const Log = require("../Models/log");
const WeeklyReport = require("../Models/weeklyReport");
const { streakCalculator } = require("../utils/streakCalculator");
const { generateWeeklyInsight } = require("../service/insightService");

const handleDashboard = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('logs');

        // Recalculate dynamic streak (fixes stale streaks from inactivity)
        const liveStreak = await streakCalculator(req.user._id);
        if (liveStreak !== user.currentStreak) {
            user.currentStreak = liveStreak;
            await user.save();
        }

        let dateAWeekAgo = new Date();
        dateAWeekAgo.setDate(dateAWeekAgo.getDate() - 7);

        const sortedLogs = user.logs.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentLogs = sortedLogs.slice(0, 3);

        // Build heatmap: { "2026-04-14": 2, ... } for the current year
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const heatmapData = {};
        user.logs.forEach(log => {
            const d = new Date(log.date);
            if (d >= startOfYear) {
                const key = d.toISOString().split('T')[0];
                heatmapData[key] = (heatmapData[key] || 0) + 1;
            }
        });

        // ── Weekly Insight (lazy generation via OpenRouter) ──────────────────
        const now = new Date();
        const createdDay = user.createdAt ? user.createdAt.getDay() : 1; // fallback Monday
        const todayDay = now.getDay();

        // Compute the most recent occurrence of the refresh day (on or before today)
        const daysBack = (todayDay - createdDay + 7) % 7;
        const thisWeekStart = new Date(now); 
        thisWeekStart.setDate(now.getDate() - daysBack);
        thisWeekStart.setHours(0, 0, 0, 0);

        // Look for an existing report for this exact week
        let currentReport = await WeeklyReport.findOne({
            userId: user._id,
            weekStart: thisWeekStart,
        });

        // Compute log count for insight regardless of day (for status reporting)
        const oneWeekAgo = new Date(thisWeekStart);
        oneWeekAgo.setDate(thisWeekStart.getDate() - 7);
        const weekLogsForInsight = user.logs.filter(l => new Date(l.date) >= oneWeekAgo);

        let insightStatus = null; // will tell frontend WHY insight is missing

        // It's the refresh day and no report exists for this week yet — generate
        if (!currentReport && todayDay === createdDay) {
            if (weekLogsForInsight.length >= 3) {
                try {
                    const summaryText = await generateWeeklyInsight(weekLogsForInsight);
                    currentReport = await WeeklyReport.create({
                        userId: user._id,
                        weekStart: thisWeekStart,
                        summaryText,
                        createdAt: now,
                    });
                } catch (err) {
                    // Non-fatal — serve whatever is cached
                    const detail = err.response
                        ? `HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`
                        : err.message;
                    console.error("Weekly insight generation failed:", detail);
                    insightStatus = "generation_failed";
                }
            } else {
                insightStatus = "not_enough_logs";
            }
        } else if (currentReport) {
            insightStatus = "ready";
        } else if (todayDay !== createdDay) {
            insightStatus = "not_refresh_day";
        }

        // If not refresh day (or generation failed), serve the most recent report
        if (!currentReport) {
            currentReport = await WeeklyReport
                .findOne({ userId: user._id })
                .sort({ weekStart: -1 });
            if (currentReport) insightStatus = "showing_previous";
        }

        const refreshDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const logsThisWeek = user.logs.filter((log) => new Date(log.date) > dateAWeekAgo);
        const activeDaysThisWeek = new Set(
            logsThisWeek.map((log) => new Date(log.date).toISOString().split('T')[0])
        ).size;

        const dashboardItems = {
            currentStreak: liveStreak,
            longestStreak: user.longestStreak,
            totalLogs: user.logs.length,
            logsThisWeek: logsThisWeek.length,
            activeDaysThisWeek,
            recentLogs,
            heatmapData,
            weeklyInsight: currentReport?.summaryText || null,
            insightGeneratedAt: currentReport?.createdAt || null,
            insightRefreshDay: refreshDayNames[createdDay],
            insightStatus,
            weekLogsCount: weekLogsForInsight.length,
        };

        res.status(200).json(dashboardItems);
    } catch (err) {
        next(err);
    }
}

module.exports = { handleDashboard };
