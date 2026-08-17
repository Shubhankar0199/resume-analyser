# Resume Analysis — Setup

## 1. Backend (`backend/main.py`)

```bash
cd backend
pip install -r requirements.txt
export GROQ_API_KEY=your_groq_key_here     # Windows: set GROQ_API_KEY=your_groq_key_here
uvicorn main:app --reload --port 8000
```

Confirm it's up: open `http://localhost:8000` — you should see
`{"status": "ok", ...}`.

CORS is already enabled in `main.py` for:
- `http://localhost:5173` / `http://127.0.0.1:5173` (Vite default)
- `http://localhost:3000` / `http://127.0.0.1:3000` (Create React App default)

If your frontend runs on a different port, add it to the `allow_origins`
list in `main.py`.

## 2. Frontend (`frontend-src-App.jsx`)

Drop this file into your React project as `src/App.jsx` (or import it
into whatever entry point you're using).

At the top of the file:

```js
const API_BASE_URL = "http://localhost:8000";
```

Change this to wherever your backend actually ends up running —
`localhost:8000` while developing, your real domain once deployed.

Then start your React dev server as usual (`npm run dev` for Vite,
`npm start` for CRA) and open it in the browser.

## 3. How they connect

The frontend submits a `multipart/form-data` POST to
`{API_BASE_URL}/api/analyze` with two fields:
- `job_description` — plain text
- `resume` — the uploaded `.pdf` or `.docx` file

The backend extracts the resume text, runs it through three Groq calls
(parse job description → parse resume → compare), and returns:

```json
{
  "success": true,
  "job": { ... },
  "resume": { ... },
  "match": {
    "score": 78,
    "candidate_name": "...",
    "matching_skills": [...],
    "missing_important_skills": [...],
    "keyword_suggestions": [...],
    "experience_requirement_met": true,
    "final_verdict": "..."
  }
}
```

The frontend reads `data.match` and renders the score stamp, missing
skills, suggested keywords, and matched skills directly from it — no
transformation needed, the shapes already line up.
