pdfjsLib.GlobalWorkerOptions.workerSrc =
 "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

let file = null;
const fileInput = document.getElementById("fileInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const loading = document.getElementById("loading");
const results = document.getElementById("results");
const errorBox = document.getElementById("error");
const jobDesc = document.getElementById("jobDesc");
const fileInfo = document.getElementById("fileInfo");

fileInput.onchange = e => { file = e.target.files[0]; showFile(); };

function showFile() {
    fileInfo.textContent = `Selected: ${file.name}`;
    fileInfo.classList.add("active");
    analyzeBtn.disabled = false;
}

async function extractPDF(file) {
    const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        text += page.getTextContent().then(t => t.items.map(i => i.str).join(" "));
    }
    return text;
}

async function analyzeResume() {
    loading.classList.add("active");
    results.classList.remove("active");
    errorBox.classList.remove("active");

    const text = await extractPDF(file);
    const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ resumeText: text, jobDescription: jobDesc.value })
    });

    const { analysis } = await response.json();

    results.innerHTML = `
    <div class="score-card">
        <div class="score-title">ATS Compatibility Score</div>
        <div class="score-value">${analysis.atsScore}/100</div>
    </div>
    <div class="analysis-section"><h3>Summary</h3><p>${analysis.summary}</p></div>
    <div class="analysis-section"><h3>Skill Gaps</h3><p>${analysis.skillGaps}</p></div>
    <div class="analysis-section"><h3>Strengths</h3><p>${analysis.strengths}</p></div>
    <div class="analysis-section"><h3>Recommendations</h3><p>${analysis.recommendations}</p></div>
    <div class="analysis-section"><h3>Job Match Fit</h3><p>${analysis.jobFit}</p></div>
    `;

    loading.classList.remove("active");
    results.classList.add("active");
}

analyzeBtn.onclick = analyzeResume;
