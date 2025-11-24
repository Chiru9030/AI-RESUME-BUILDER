const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

function getApiKey() {
    try {
        const envPath = path.join(__dirname, '.env');
        if (!fs.existsSync(envPath)) {
            console.error('⚠️  .env file not found. Please create one with your GEMINI_API_KEY');
            return null;
        }
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.+)/);
        return match ? match[1].trim() : null;
    } catch (error) {
        console.error('Error reading .env:', error.message);
        return null;
    }
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/' || req.url === '/index.html') {
        const htmlPath = path.join(__dirname, 'index.html');
        const html = fs.readFileSync(htmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        return;
    }

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
                if (!apiKey) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Gemini API key not configured in .env file' }));
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

                const geminiResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
                    throw new Error(`Gemini API request failed: ${errorText}`);
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
            } catch (error) {
                console.error('Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to analyze resume', details: error.message }));
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
