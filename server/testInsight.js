/**
 * Quick test for insightService.js
 * Run from the server directory:  node testInsight.js
 */

require("dotenv").config({ path: "../.env" });
const { generateWeeklyInsight } = require("./service/insightService");

const fakeLogs = [
    {
        title: "Fixed streak reset bug",
        date: new Date("2026-04-24"),
        content:
            "Tracked down a bug where the user's streak was resetting at midnight even when a log was already submitted that day. The fix was in streakCalculator.js — changed the date comparison to use toDateString() instead of full ISO timestamps so same-day logs always match.",
        tags: ["bug", "backend", "node.js"],
    },
    {
        title: "Built contribution heatmap",
        date: new Date("2026-04-25"),
        content:
            "Implemented a GitHub-style contribution grid on the Dashboard using pure CSS divs — no library. Backend aggregates logs by YYYY-MM-DD key. Frontend uses a CSS grid with repeat(N, 1fr) so it scales to full container width. Added hover tooltips with date + log count.",
        tags: ["frontend", "react", "dashboard"],
    },
    {
        title: "Started weekly AI insights feature",
        date: new Date("2026-04-27"),
        content:
            "Designed the lazy generation strategy for weekly AI insights. Using WeeklyReport model (already existed) as the storage layer. On the user's account creation day-of-week, the controller calls OpenRouter (Nemotron Nano Omni) and stores the result. Other days it just returns the cached report.",
        tags: ["ai", "openrouter", "architecture"],
    },
];

(async () => {
    console.log("⚡ Calling OpenRouter / Nemotron Nano Omni...\n");
    try {
        const result = await generateWeeklyInsight(fakeLogs);
        console.log("✅ Insight generated:\n");
        console.log("─".repeat(60));
        console.log(result);
        console.log("─".repeat(60));
    } catch (err) {
        console.error("❌ Failed:", err.message);
        if (err.response) {
            console.error("HTTP status:", err.response.status);
            console.error("Body:", JSON.stringify(err.response.data, null, 2));
        }
    }
})();
