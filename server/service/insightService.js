const axios = require("axios");

/**
 * Generates a weekly insight summary using Nvidia Nemotron Nano Omni
 * via the OpenRouter API (OpenAI-compatible).
 *
 * @param {Array} logs - Array of Log documents from the past week
 * @returns {Promise<string>} - The generated insight text
 */
async function generateWeeklyInsight(logs) {
    const logSummaries = logs
        .map((log, i) => {
            const dateStr = new Date(log.date).toDateString();
            const snippet = log.content.slice(0, 400);
            const tags = log.tags && log.tags.length > 0 ? `[${log.tags.join(", ")}]` : "";
            return `[${i + 1}] ${log.title} ${tags} — ${dateStr}\n${snippet}`;
        })
        .join("\n\n");

    const prompt = `Generate a weekly summary and actionable insights for a developer based on their log entries.

The goal is to provide a comprehensive overview of the developer's week, highlighting their accomplishments and areas for improvement, delivered in a human and technically informed tone.

# Input Data

You will be provided with the developer's log entries below:
${logSummaries}

# Steps

1.  **Analyze Log Entries**: Carefully review all provided log entries to identify key themes, topics, technologies, and tasks.
2.  **Synthesize "What was done"**: Consolidate the analyzed information into a cohesive narrative detailing what the developer accomplished this week.
3.  **Synthesize "What can be done more"**: Identify areas for potential improvement, new concepts to explore, or actionable advice for the upcoming week based on their current trajectory.

# Output Format

The output MUST be formatted in Markdown with exactly two sections using H3 (###) headers:

### What was done
(Your 1-3 paragraphs of flowing prose summarizing their achievements. Be specific to the technologies and tasks in their logs. Do NOT use bullet points.)

### What can be done more
(Your 1-3 paragraphs of flowing prose offering actionable advice, forward-looking suggestions, and areas for improvement. Do NOT use bullet points.)

# Rules
* The total length should be around 300 to 400 words.
* Flowing prose only — no bullet points, no lists.
* Technical but human in tone.
* Be highly specific to what was actually logged, not generic.`;





    const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: 4096,
            temperature: 0.7,
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.APP_URL || "http://localhost:5173",
                "X-Title": "Devjrnl Weekly Insight",
            },
            timeout: 30000, // 30s timeout
        }
    );

    console.log("Raw OpenRouter response:", JSON.stringify(response.data, null, 2));
    const message = response.data?.choices?.[0]?.message;
    const text = message?.content || message?.reasoning;
    if (!text) throw new Error("Empty response from OpenRouter");
    return text.trim();
}

module.exports = { generateWeeklyInsight };
