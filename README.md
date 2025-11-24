# AI Resume Analyzer 🚀

A simple, AI-powered resume analyzer that provides instant feedback on ATS compatibility, skill gaps, and recommendations using Google's Gemini AI.

![AI Resume Analyzer](https://img.shields.io/badge/AI-Powered-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 📄 **PDF Upload** - Drag-and-drop or click to upload PDF resumes
- 🤖 **AI Analysis** - Powered by Google Gemini 2.5 Flash
- 📊 **ATS Score** - Get compatibility score (0-100)
- 🎯 **Skill Gap Analysis** - Identify missing skills
- ✨ **Strengths Highlighting** - Discover your resume's strong points
- 💡 **Actionable Recommendations** - Get specific improvement suggestions
- 🎨 **Modern UI** - Beautiful, responsive design with animations

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-resume-analyzer.git
   cd ai-resume-analyzer
   ```

2. **Create `.env` file**
   ```bash
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   ```

3. **Start the server**
   ```bash
   node server.js
   ```

4. **Open in browser**
   ```
   http://localhost:8080
   ```

## 📁 Project Structure

```
ai-resume-analyzer/
├── index.html      # Complete web application (HTML + CSS + JS)
├── server.js       # Node.js backend server
├── .env            # API key configuration (create this)
├── .gitignore      # Git ignore file
└── README.md       # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8080  # Optional, defaults to 8080
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

## 💻 Usage

1. **Start the server**
   ```bash
   node server.js
   ```

2. **Upload your resume**
   - Open http://localhost:8080
   - Click or drag-and-drop your PDF resume
   - Optionally add a job description for tailored analysis

3. **Get instant feedback**
   - ATS compatibility score
   - Skill gap analysis
   - Strengths and recommendations

## 🎨 Features in Detail

### PDF Text Extraction
- Uses PDF.js library for client-side PDF parsing
- Supports multi-page PDFs
- Maximum file size: 10MB

### AI Analysis
- Powered by Google Gemini 2.5 Flash model
- Analyzes resume structure and content
- Compares against job descriptions (optional)
- Provides actionable feedback

### Modern UI
- Gradient backgrounds
- Smooth animations
- Responsive design
- Drag-and-drop support

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js (built-in HTTP module)
- **PDF Processing**: PDF.js (CDN)
- **AI**: Google Gemini API
- **Dependencies**: Zero npm packages required!

## 📝 API Endpoints

### `POST /api/analyze`

Analyzes a resume and returns feedback.

**Request Body:**
```json
{
  "resumeText": "string",
  "jobDescription": "string (optional)"
}
```

**Response:**
```json
{
  "analysis": {
    "atsScore": 85,
    "summary": "...",
    "skillGaps": "...",
    "strengths": "...",
    "recommendations": "..."
  }
}
```

## 🚀 Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set GEMINI_API_KEY=your_key_here
git push heroku main
```

### Deploy to Vercel

```bash
# Install Vercel CLI
vercel
# Add GEMINI_API_KEY in Vercel dashboard
```

### Deploy to Railway

```bash
# Connect your GitHub repo to Railway
# Add GEMINI_API_KEY environment variable
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for the powerful language model
- PDF.js for client-side PDF processing
- The open-source community

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/ai-resume-analyzer](https://github.com/yourusername/ai-resume-analyzer)

---

Made with ❤️ by [Your Name]
