import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.static("."));

// Rate Limit (Prevent spam/abuse)
let requestCount = 0;
setInterval(() => (requestCount = 0), 60000); // reset every 1 min

// ----- AI RESUME ANALYSIS ENDPOINT -----
app.post("/api/analyze", async (req, res) => {
    requestCount++;
    if (requestCount > 60) return res.json({ error: "Rate limit exceeded" });

    const { resumeText, jobDescription } = req.body;
    if (!resumeText) return res.status(400).json({ error: "Resume text required" });

    const API_KEY = process.env.GEMINI_API_KEY;

    // 🔥 LOCAL ATS SCORING ENGINE
    function localATS(text, JD) {
        let keywords = ["React", "Node", "Python", "Java", "AWS", "MongoDB", "Leadership", "Docker"];
        const found = keywords.filter(k => new RegExp(k, "i").test(text));

        const atsScore = 60 + found.length * 3;
        let jdMatch = 0;

        if (JD) {
            const JDwords = JD.split(/\W+/);
            JDwords.forEach(w => { if (text.includes(w)) jdMatch++; });
        }

        return {
            atsScore: Math.min(atsScore, 90),
            summary: "Resume reviewed. Strong skill presence detected, structured profile.",
            strengths: found.slice(0, 4).join(", ") || "No strong highlights detected",
            skillGaps: "Missing cloud, Kubernetes exposure",
            jobFit: JD ? `${Math.round((jdMatch / JD.split(/\W+/).length) * 100)}%` : "N/A",
            recommendations: "Add quantified achievements + project impact metrics."
        };
    }

    // If no key → run offline mode
    if (!API_KEY) return res.json({ analysis: localATS(resumeText, jobDescription) });

    // ---- AI MODE (Gemini API) ----
    const prompt = `You are an ATS evaluator. Return ONLY JSON in this format:
{
 "atsScore": number (strict, avg=55-70),
 "summary": "brief critical summary",
 "skillGaps": "missing skills",
 "strengths": "top improvements",
 "recommendations": "fixes required",
 "jobFit": "% match from job description"
}

Resume:
${resumeText}

Job Description:
${jobDescription || "None provided"}
`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            }
        );

        const data = await response.json();
        let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        // Safe JSON Parser — even if Gemini adds markdown
        raw = raw?.replace(/```json|```/g, "");
        const finalJSON = JSON.parse(raw);

        return res.json({ analysis: finalJSON });
    } catch (err) {
        return res.json({ analysis: localATS(resumeText, jobDescription) });
    }
});

// Start server
app.listen(PORT, () =>
    console.log(`\n🚀 AI Resume Analyzer running → http://localhost:${PORT}\n`)
);
