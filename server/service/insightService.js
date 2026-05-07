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

# Input Data

Developer log entries for the week:
${logSummaries}

# Output Format

Output MUST be valid Markdown with exactly two sections. Use bold H3 headers exactly as shown:

### **What was done**
- A concise bullet point about a specific accomplishment
- Another bullet point about a distinct task or feature
- (3–6 bullets total, each 1–2 sentences max)

### **What can be done more**
- A concise actionable suggestion
- Another forward-looking improvement
- (3–5 bullets total, each 1–2 sentences max)

# Rules
* Use ONLY bullet points under each section — no paragraphs, no prose blocks.
* Each bullet must be specific to what was actually in the logs. No generic advice.
* Keep the entire output under 300 words.
* Technical but human in tone.
* Do NOT add any text outside the two sections.
*refer to the developer as 'you' and speak accordingly to them`;





    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not set in environment variables");
    }

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
