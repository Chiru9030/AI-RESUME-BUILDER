pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
let selectedFile = null;
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const analyzeBtn = document.getElementById('analyzeBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const results = document.getElementById('results');
const jobDesc = document.getElementById('jobDesc');

uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', (e) => { if (e.target.files.length > 0) handleFile(e.target.files[0]); });

function handleFile(file) {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        showError('Error: Incorrect file uploaded. Please upload a PDF or Image (JPG/PNG) file.');
        return;
    }
    if (file.size > 10 * 1024 * 1024) { showError('File size must be less than 10MB'); return; }
    selectedFile = file;
    fileInfo.textContent = `✓ ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    fileInfo.classList.add('active');
    analyzeBtn.disabled = false;
    error.classList.remove('active');
}

analyzeBtn.addEventListener('click', analyzeResume);

async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }
    return fullText;
}

async function extractTextFromImage(file) {
    const worker = await Tesseract.createWorker('eng');
    const ret = await worker.recognize(file);
    await worker.terminate();
    return ret.data.text;
}

function validateContent(text) {
    const keywords = ['experience', 'education', 'skills', 'work history', 'project', 'summary', 'profile', 'cv', 'resume', 'contact', 'references'];
    const lowerText = text.toLowerCase();
    let matchCount = 0;
    for (const keyword of keywords) {
        if (lowerText.includes(keyword)) matchCount++;
    }
    return matchCount >= 2;
}

async function analyzeResume() {
    if (!selectedFile) return;
    loading.classList.add('active');
    results.classList.remove('active');
    error.classList.remove('active');
    analyzeBtn.disabled = true;
    try {
        let resumeText = '';
        if (selectedFile.type === 'application/pdf') {
            resumeText = await extractTextFromPDF(selectedFile);
        } else {
            resumeText = await extractTextFromImage(selectedFile);
        }

        if (!resumeText.trim()) throw new Error('Could not extract text from file');

        if (!validateContent(resumeText)) {
            throw new Error('Uploaded file does not appear to be a valid Resume/CV. Please upload a relevant document.');
        }

        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeText: resumeText, jobDescription: jobDesc.value })
        });
        if (!response.ok) throw new Error('Analysis failed');
        const data = await response.json();
        displayResults(data);
    } catch (err) {
        showError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
        loading.classList.remove('active');
        analyzeBtn.disabled = false;
    }
}

function displayResults(data) {
    const analysis = data.analysis;
    results.innerHTML = `
        <div class="score-card">
            <div class="score-title">ATS Compatibility Score</div>
            <div class="score-value">${analysis.atsScore || 'N/A'}/100</div>
        </div>
        <div class="analysis-section">
            <h3>📊 Overall Assessment</h3>
            <p>${analysis.summary || 'No summary available'}</p>
        </div>
        <div class="analysis-section">
            <h3>🎯 Skill Gaps</h3>
            <p>${analysis.skillGaps || 'No skill gaps identified'}</p>
        </div>
        <div class="analysis-section">
            <h3>✨ Strengths</h3>
            <p>${analysis.strengths || 'No strengths identified'}</p>
        </div>
        <div class="analysis-section">
            <h3>💡 Recommendations</h3>
            <p>${analysis.recommendations || 'No recommendations available'}</p>
        </div>
    `;
    results.classList.add('active');
}

function showError(message) {
    error.textContent = '⚠️ ' + message;
    error.classList.add('active');
}

