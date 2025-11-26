const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

function getApiKey() {
    const key = process.env.GEMINI_API_KEY || 'AIzaSyBZcCtp4Bvkvost3S5Z4t5TH2iqv7VL_Jc';
    if (!key || key === 'your_api_key_here') {
        console.log('ℹ️  No GEMINI_API_KEY environment variable found. Using Mock Mode.');
        return null;
    }
    return key;
}

const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve Static Files
    if (req.method === 'GET') {
        let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
        const extname = path.extname(filePath);
        let contentType = 'text/html';

        switch (extname) {
            case '.js': contentType = 'text/javascript'; break;
            case '.css': contentType = 'text/css'; break;
            case '.json': contentType = 'application/json'; break;
            case '.png': contentType = 'image/png'; break;
            case '.jpg': contentType = 'image/jpg'; break;
        }

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end('File Not Found');
                } else {
                    res.writeHead(500);
                    res.end(`Server Error: ${err.code}`);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
        return;
    }

    // API Endpoint
    if (req.url === '/api/analyze' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { resumeText, jobDescription } = JSON.parse(body);
                if (!resumeText) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Resume text is required' }));
                    return;
                }

                const apiKey = getApiKey();

                // Enhanced Mock Mode: Local Analysis Logic
                const analyzeLocal = (text) => {
                    const keywords = {
                        languages: ['Javascript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift'],
                        frontend: ['React', 'Angular', 'Vue', 'HTML', 'CSS', 'Redux', 'Webpack', 'Tailwind'],
                        backend: ['Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'PostgreSQL', 'MongoDB', 'SQL'],
                        cloud: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD'],
                        softSkills: ['Leadership', 'Communication', 'Agile', 'Scrum', 'Project Management', 'Teamwork']
                    };

                    const escapeRegExp = (string) => {
                        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    };

                    const foundSkills = {
                        languages: keywords.languages.filter(k => new RegExp(escapeRegExp(k), 'i').test(text)),
                        frontend: keywords.frontend.filter(k => new RegExp(escapeRegExp(k), 'i').test(text)),
                        backend: keywords.backend.filter(k => new RegExp(escapeRegExp(k), 'i').test(text)),
                        cloud: keywords.cloud.filter(k => new RegExp(escapeRegExp(k), 'i').test(text)),
                        softSkills: keywords.softSkills.filter(k => new RegExp(escapeRegExp(k), 'i').test(text))
                    };

                    const allFound = [...foundSkills.languages, ...foundSkills.frontend, ...foundSkills.backend, ...foundSkills.cloud, ...foundSkills.softSkills];

                    // Calculate a pseudo-score based on keyword density and variety
                    const scoreBase = 70;
                    const varietyBonus = (Object.values(foundSkills).filter(cat => cat.length > 0).length) * 5;
                    const countBonus = Math.min(allFound.length * 2, 15);
                    const atsScore = Math.min(scoreBase + varietyBonus + countBonus, 98);

                    // Generate Summary
                    let summary = "The candidate presents a solid profile";
                    if (foundSkills.languages.length > 2) summary += ` with strong versatility in programming languages (${foundSkills.languages.slice(0, 3).join(', ')}).`;
                    else if (foundSkills.frontend.length > 0) summary += ` focused on frontend development technologies.`;
                    else if (foundSkills.backend.length > 0) summary += ` with a focus on backend systems.`;
                    else summary += ".";

                    summary += " The resume is well-structured, though adding more quantifiable metrics could enhance impact.";

                    // Generate Strengths
                    const strengths = [];
                    if (foundSkills.cloud.length > 0) strengths.push("Modern cloud & DevOps competency");
                    if (foundSkills.softSkills.length > 0) strengths.push("Highlighted soft skills and leadership potential");
                    if (allFound.length > 5) strengths.push("Diverse technical skill set");
                    if (strengths.length === 0) strengths.push("Clear professional history", "Education credentials visible");

                    // Generate Gaps (Inverse of what's found)
                    const gaps = [];
                    if (foundSkills.cloud.length === 0) gaps.push("Cloud platforms (AWS/Azure)");
                    if (foundSkills.backend.length === 0 && foundSkills.frontend.length > 0) gaps.push("Backend integration knowledge");
                    if (foundSkills.frontend.length === 0 && foundSkills.backend.length > 0) gaps.push("Modern frontend frameworks");
                    if (gaps.length === 0) gaps.push("Advanced system architecture certifications");

                    return {
                        atsScore: atsScore,
                        summary: summary,
                        skillGaps: gaps.join(", "),
                        strengths: strengths.join(", "),
                        recommendations: "Quantify achievements with specific numbers (e.g., 'improved performance by 20%'). Ensure all dates are consistent. Tailor the summary to specific job descriptions."
                    };
                };

                // If no API key or if API fails, use local analysis
                if (!apiKey) {
                    console.log('ℹ️  Running in Local Analysis Mode (No API Key)');
                    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
                    try {
                        const analysis = analyzeLocal(resumeText);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ analysis }));
                    } catch (localError) {
                        console.error('Local Analysis Error:', localError);
                        if (!res.headersSent) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Local analysis failed' }));
                        }
                    }
                    return;
                }

                const prompt = `You are an expert resume analyzer and ATS (Applicant Tracking System) specialist. Analyze the following resume and provide detailed feedback.

Resume Content:
${resumeText}

${jobDescription ? `Job Description:\n${jobDescription}\n` : ''}

Please provide a comprehensive analysis in the following JSON format:
{
    "atsScore": <number between 0-100>,
    "summary": "<brief overall assessment>",
    "skillGaps": "<identified skill gaps${jobDescription ? ' compared to job description' : ''}>",
    "strengths": "<key strengths and highlights>",
    "recommendations": "<specific actionable recommendations>"
}

Respond ONLY with valid JSON, no additional text.`;

                try {
                    // Using gemini-2.5-flash-lite model
                    const geminiResponse = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ parts: [{ text: prompt }] }]
                            })
                        }
                    );

                    if (!geminiResponse.ok) {
                        const errorText = await geminiResponse.text();
                        console.error(`Gemini API request failed: ${errorText}`);
                        console.log('⚠️  API call failed. Falling back to Local Mode.');

                        // Fallback to local analysis
                        const analysis = analyzeLocal(resumeText);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ analysis }));
                        return;
                    }

                    const geminiData = await geminiResponse.json();
                    const responseText = geminiData.candidates[0].content.parts[0].text;

                    let analysis;
                    try {
                        analysis = JSON.parse(responseText);
                    } catch (e) {
                        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                            responseText.match(/```\n([\s\S]*?)\n```/) ||
                            responseText.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                        } else {
                            throw new Error('Could not parse AI response');
                        }
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ analysis }));
                } catch (apiError) {
                    console.error('API Error:', apiError);
                    console.log('⚠️  API execution failed. Falling back to Local Mode.');
                    try {
                        const analysis = analyzeLocal(resumeText);
                        if (!res.headersSent) {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ analysis }));
                        }
                    } catch (fallbackError) {
                        console.error('Fallback Error:', fallbackError);
                        if (!res.headersSent) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Analysis failed' }));
                        }
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to analyze resume', details: error.message }));
                }
            }
        });
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`\n🚀 AI Resume Analyzer is running!`);
    console.log(`\n📱 Open in your browser: http://localhost:${PORT}`);
    console.log(`\n✨ Upload a PDF resume to get started!\n`);
});
