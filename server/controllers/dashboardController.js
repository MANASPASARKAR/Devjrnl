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

        // ── Weekly Insight (rolling 7-day cycle) ──────────────────────────────
        const now = new Date();
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

        // Always work with the most recent report for this user
        const latestReport = await WeeklyReport
            .findOne({ userId: user._id })
            .sort({ weekStart: -1 });

        let currentReport = latestReport;
        let insightStatus = null;
        let insightNextRefresh = null;

        const lastGeneratedAt = latestReport ? new Date(latestReport.weekStart) : null;

        // First insight: only after account is 7 days old
        // Subsequent insights: 7 days after the last report was generated
        const firstInsightUnlockDate = user.createdAt
            ? new Date(new Date(user.createdAt).getTime() + SEVEN_DAYS_MS)
            : new Date(0); // if no createdAt somehow, allow immediately

        const isDue = lastGeneratedAt
            ? (now - lastGeneratedAt) >= SEVEN_DAYS_MS          // rolling cycle
            : now >= firstInsightUnlockDate;                     // first time: 7 days after signup

        if (isDue) {
            // Period start = last report date (or createdAt for first report)
            const periodStart = lastGeneratedAt
                ? lastGeneratedAt
                : (user.createdAt ? new Date(user.createdAt) : new Date(now.getTime() - SEVEN_DAYS_MS));

            // Always exactly 7 days — regardless of how late the user logs in
            const periodEnd = new Date(periodStart.getTime() + SEVEN_DAYS_MS);

            const weekLogs = user.logs.filter(l => {
                const d = new Date(l.date);
                return d >= periodStart && d <= periodEnd;
            });

            if (weekLogs.length >= 3) {
                try {
                    const summaryText = await generateWeeklyInsight(weekLogs);
                    currentReport = await WeeklyReport.create({
                        userId: user._id,
                        weekStart: now,         // next report due 7 days from this login
                        summaryText,
                        createdAt: now,
                        periodStart,
                    });
                    insightStatus = "ready";
                    insightNextRefresh = new Date(now.getTime() + SEVEN_DAYS_MS);
                } catch (err) {
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
            insightStatus = lastGeneratedAt ? "ready" : "showing_previous";
            insightNextRefresh = new Date(lastGeneratedAt.getTime() + SEVEN_DAYS_MS);
        } else {
            // No report yet, not due yet — show when the first one will unlock
            insightStatus = "not_yet_due";
            insightNextRefresh = firstInsightUnlockDate;
        }

        const logsThisWeek = user.logs.filter((log) => new Date(log.date) > dateAWeekAgo);
        const activeDaysThisWeek = new Set(
            logsThisWeek.map((log) => new Date(log.date).toISOString().split('T')[0])
        ).size;

        // How many logs since the last report (for status reporting — matches the actual filter)
        const countPeriodStart = lastGeneratedAt
            || (user.createdAt ? new Date(user.createdAt) : new Date(now.getTime() - SEVEN_DAYS_MS));
        const weekLogsCount = user.logs.filter(l => new Date(l.date) >= countPeriodStart).length;

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
            insightPeriodStart: currentReport?.periodStart || null,  // exact start of the log window
            insightNextRefresh,   // ISO date of when next report will generate
            insightStatus,
            weekLogsCount,
        };

        res.status(200).json(dashboardItems);
    } catch (err) {
        next(err);
    }
}

module.exports = { handleDashboard };
