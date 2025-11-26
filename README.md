# AI Resume Analyzer 🚀

A powerful, AI-driven tool to analyze resumes against job descriptions, providing ATS compatibility scores, skill gap analysis, and actionable recommendations.

## ✨ Features

-   **AI-Powered Analysis**: Uses Google's Gemini 1.5 Flash (or Pro) model for deep, critical analysis.
-   **ATS Scoring**: Provides a strict, realistic ATS compatibility score based on keywords, formatting, and metrics.
-   **Skill Gap Detection**: Identifies missing skills crucial for the target role.
-   **Smart Recommendations**: Offers concrete steps to improve your resume's impact.
-   **Local Mock Mode**: Works even without an API key (simulated analysis) for testing.
-   **Secure**: Your API key is used only for the session and not stored permanently.

## �️ Tech Stack

-   **Frontend**: HTML5, CSS3, Vanilla JavaScript
-   **Backend**: Node.js (Native HTTP module)
-   **AI Integration**: Google Gemini API

## � Getting Started

### Prerequisites

-   Node.js installed on your machine.
-   A Google Gemini API Key (Get one from [Google AI Studio](https://aistudio.google.com/)).

### Installation

1.  Clone the repository (or download the files).
2.  Navigate to the project directory:
    ```bash
    cd AI_RESUME_BUILDER
    ```
3.  Install dependencies (if any - currently zero dependencies for the core server, but `pdf.js` and `tesseract.js` are loaded via CDN).

### Running the Application

1.  **Start the Server**:
    The project comes pre-configured with a **Demo API Key** for instant testing. You can simply run:
    ```bash
    node server.js
    ```
    *Note: For production use, please set your own `GEMINI_API_KEY` environment variable.*

2.  **Open in Browser**:
    Visit `http://localhost:8080`

3.  **Analyze**:
    -   Upload your Resume (PDF or Image).
    -   (Optional) Paste the Job Description.
    -   Click **Analyze Resume**.

## ⚠️ Security Note

> [!WARNING]
> This repository includes a **public demo API key** for ease of use. If you fork this project for production, **please replace it with your own secure key** and use environment variables. The demo key may be rate-limited or revoked at any time.
