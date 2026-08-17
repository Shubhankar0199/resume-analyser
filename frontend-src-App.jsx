import React, { useRef, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap');
`;

export default function App() {
  const [jd, setJd] = useState("");
  const [file, setFile] = useState(null);

  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  const [candidateName, setCandidateName] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const filename = selectedFile.name.toLowerCase();

    if (
      !filename.endsWith(".pdf") &&
      !filename.endsWith(".docx")
    ) {
      setErrorMsg("Only PDF or DOCX resumes are supported.");
      setFile(null);
      return;
    }

    setErrorMsg("");
    setFile(selectedFile);
  };

  const runAnalysis = async () => {
    if (!jd.trim()) {
      setErrorMsg("Please enter a job description.");
      return;
    }

    if (!file) {
      setErrorMsg("Please upload a PDF or DOCX resume.");
      return;
    }

    setErrorMsg("");
    setResult(null);
    setStatus("scanning");

    try {
      const formData = new FormData();

      formData.append("job_description", jd);
      formData.append("resume", file);

      console.log("Sending request to:", `${API_BASE_URL}/api/analyze`);

      const response = await fetch(
        `${API_BASE_URL}/api/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("Backend response status:", response.status);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Analysis failed. Please try again."
        );
      }

      if (!data.success) {
        throw new Error("Analysis was not successful.");
      }

      console.log("Analysis result:", data);

      setResult(data.match);

      setCandidateName(
        data.match?.candidate_name ||
        data.resume?.name ||
        null
      );

      setStatus("done");
    } catch (error) {
      console.error("Analysis error:", error);

      setErrorMsg(
        error.message ||
        "Could not connect to the backend."
      );

      setStatus("error");
    }
  };

  const scoreColor = (score) => {
    if (score >= 75) {
      return "var(--accent-bright)";
    }

    if (score >= 50) {
      return "var(--amber)";
    }

    return "var(--red-pen)";
  };

  return (
    <div className="ra-root">
      <style>
        {`
          ${FONT_IMPORT}

          .ra-root {
            --ink: #10131A;
            --ink-panel: #181C25;
            --ink-panel-2: #1F2430;
            --paper: #F3EEE1;
            --paper-2: #EAE3D2;

            --ink-text: #EDEAE0;
            --ink-text-dim: #9BA0AC;

            --paper-text: #21231F;
            --paper-text-dim: #5C5847;

            --accent: #35A868;
            --accent-bright: #4FCB84;

            --red-pen: #DD4A34;
            --highlighter: #6FCB9A;
            --amber: #E0A537;

            --line-dark: rgba(237,234,224,0.10);

            font-family: 'Source Serif 4', Georgia, serif;

            background: var(--ink);
            color: var(--ink-text);

            min-height: 100vh;

            padding: 32px 20px 56px;

            box-sizing: border-box;
          }

          .ra-root *,
          .ra-root *::before,
          .ra-root *::after {
            box-sizing: border-box;
          }

          .ra-shell {
            max-width: 1040px;
            margin: 0 auto;
          }

          .ra-header {
            margin-bottom: 28px;
            border-bottom: 1px solid var(--line-dark);
            padding-bottom: 20px;
          }

          .ra-eyebrow {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--accent-bright);
            margin: 0 0 10px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .ra-eyebrow::before {
            content: "";
            width: 7px;
            height: 7px;
            background: var(--accent-bright);
            border-radius: 50%;
            display: inline-block;
          }

          .ra-title {
            font-size: clamp(28px, 4vw, 42px);
            font-weight: 700;
            margin: 0 0 8px;
            line-height: 1.05;
          }

          .ra-sub {
            color: var(--ink-text-dim);
            font-size: 15px;
            margin: 0;
            max-width: 56ch;
          }

          .ra-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 22px;
            align-items: start;
          }

          @media (max-width: 780px) {
            .ra-grid {
              grid-template-columns: 1fr;
            }
          }

          .ra-panel,
          .ra-results {
            background: var(--ink-panel);
            border: 1px solid var(--line-dark);
            border-radius: 3px;
            padding: 22px;
          }

          .ra-panel-label {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--ink-text-dim);
            margin: 0 0 12px;
            display: flex;
            justify-content: space-between;
          }

          textarea.ra-input {
            width: 100%;
            background: var(--paper);
            color: var(--paper-text);
            border: 1px solid var(--paper-2);
            border-radius: 2px;
            padding: 14px 16px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 13px;
            line-height: 1.6;
            resize: vertical;
            min-height: 220px;
          }

          textarea.ra-input::placeholder {
            color: var(--paper-text-dim);
          }

          textarea.ra-input:focus {
            outline: 2px solid var(--accent);
          }

          .ra-drop {
            background: var(--paper);
            border: 1.5px dashed var(--paper-text-dim);
            border-radius: 2px;
            min-height: 150px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            cursor: pointer;
            text-align: center;
            padding: 20px;
            position: relative;
            overflow: hidden;
          }

          .ra-drop-icon {
            width: 34px;
            height: 34px;
            border: 1.5px solid var(--paper-text);
            border-radius: 3px;
          }

          .ra-drop-text,
          .ra-drop-filename {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 12px;
          }

          .ra-drop-text {
            color: var(--paper-text-dim);
          }

          .ra-drop-filename {
            color: var(--paper-text);
            font-weight: 600;
          }

          .ra-run-btn {
            margin-top: 18px;
            width: 100%;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 13px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            font-weight: 600;
            padding: 14px 18px;
            background: var(--accent);
            color: #08160F;
            border: none;
            border-radius: 2px;
            cursor: pointer;
          }

          .ra-run-btn:hover:not(:disabled) {
            background: var(--accent-bright);
          }

          .ra-run-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .ra-error {
            margin-top: 10px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 12px;
            color: var(--red-pen);
          }

          .ra-empty,
          .ra-scanning {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            min-height: 400px;
            gap: 16px;
          }

          .ra-empty {
            color: var(--ink-text-dim);
          }

          .ra-empty-mark {
            width: 56px;
            height: 56px;
            border: 1.5px dashed var(--line-dark);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .ra-empty-text,
          .ra-scanning-text {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 12px;
            line-height: 1.6;
          }

          .ra-pulse {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            border: 2px solid var(--accent);
            border-top-color: transparent;
            animation: spin 0.9s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .ra-stamp-row {
            display: flex;
            align-items: center;
            gap: 18px;
            padding-bottom: 18px;
            border-bottom: 1px solid var(--line-dark);
            margin-bottom: 18px;
          }

          .ra-stamp {
            width: 92px;
            height: 92px;
            border-radius: 50%;
            border: 3px solid var(--stamp-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transform: rotate(-6deg);
            flex-shrink: 0;
            font-family: 'IBM Plex Mono', monospace;
          }

          .ra-stamp-num {
            font-size: 26px;
            font-weight: 700;
            color: var(--stamp-color);
          }

          .ra-stamp-den {
            font-size: 9px;
            color: var(--stamp-color);
          }

          .ra-verdict-label,
          .ra-section-title {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--ink-text-dim);
          }

          .ra-verdict-label {
            margin: 0 0 6px;
          }

          .ra-verdict-text {
            font-size: 18px;
            font-weight: 700;
            margin: 0;
            color: var(--stamp-color);
          }

          .ra-candidate {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            color: var(--ink-text-dim);
          }

          .ra-badge {
            display: inline-block;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            padding: 5px 8px;
            margin-top: 5px;
          }

          .ra-badge.yes {
            color: var(--accent-bright);
            background: rgba(79,203,132,0.14);
          }

          .ra-badge.no {
            color: #F0846F;
            background: rgba(221,74,52,0.12);
          }

          .ra-section {
            margin-bottom: 22px;
          }

          .ra-section-title {
            margin-bottom: 10px;
          }

          .ra-chip-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .ra-chip {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 12px;
            padding: 6px 11px;
            border-radius: 2px;
          }

          .ra-chip.match {
            background: rgba(79,203,132,0.14);
            color: var(--highlighter);
          }

          .ra-chip.missing {
            background: rgba(221,74,52,0.12);
            color: #F0846F;
          }

          .ra-chip.suggest {
            background: rgba(224,165,55,0.12);
            color: var(--amber);
          }

          .ra-feedback {
            font-size: 14.5px;
            line-height: 1.65;
            background: var(--ink-panel-2);
            border-left: 2px solid var(--accent);
            padding: 12px 16px;
          }
        `}
      </style>

      <div className="ra-shell">

        <header className="ra-header">

          <p className="ra-eyebrow">
            AI resume screener
          </p>

          <h1 className="ra-title">
            Resume Analysis
          </h1>

          <p className="ra-sub">
            Paste the job description, upload your resume,
            and get an ATS-style match score.
          </p>

        </header>

        <div className="ra-grid">

          {/* LEFT SIDE */}

          <div>

            <div
              className="ra-panel"
              style={{ marginBottom: 16 }}
            >

              <p className="ra-panel-label">
                Job description

                <span>
                  {
                    jd
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean)
                      .length
                  } words
                </span>
              </p>

              <textarea
                className="ra-input"
                placeholder="Paste the complete job description here..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />

            </div>

            <div className="ra-panel">

              <p className="ra-panel-label">
                Resume PDF / DOCX
              </p>

              <div
                className="ra-drop"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                onDragOver={(e) =>
                  e.preventDefault()
                }
                onDrop={(e) => {
                  e.preventDefault();

                  handleFile(
                    e.dataTransfer.files?.[0]
                  );
                }}
              >

                {file ? (
                  <>
                    <div className="ra-drop-filename">
                      {file.name}
                    </div>

                    <div className="ra-drop-text">
                      Click to replace
                    </div>
                  </>
                ) : (
                  <div className="ra-drop-text">
                    Drop PDF/DOCX here or click to browse
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  style={{ display: "none" }}
                  onChange={(e) =>
                    handleFile(
                      e.target.files?.[0]
                    )
                  }
                />

              </div>

              <button
                className="ra-run-btn"
                onClick={runAnalysis}
                disabled={status === "scanning"}
              >
                {status === "scanning"
                  ? "Scanning..."
                  : "Run Scan →"}
              </button>

              {errorMsg && (
                <p className="ra-error">
                  {errorMsg}
                </p>
              )}

            </div>

          </div>


          {/* RIGHT SIDE */}

          <div className="ra-results">

            {status === "idle" && (
              <div className="ra-empty">

                <div className="ra-empty-mark">
                  0/100
                </div>

                <p className="ra-empty-text">
                  Results will appear here after
                  you run the scan.
                </p>

              </div>
            )}


            {status === "scanning" && (
              <div className="ra-scanning">

                <div className="ra-pulse" />

                <p className="ra-scanning-text">
                  Comparing resume against job description...
                </p>

              </div>
            )}


            {status === "done" && result && (
              <>

                <div
                  className="ra-stamp-row"
                  style={{
                    "--stamp-color":
                      scoreColor(result.score),
                  }}
                >

                  <div className="ra-stamp">

                    <div className="ra-stamp-num">
                      {Math.round(result.score)}
                    </div>

                    <div className="ra-stamp-den">
                      / 100
                    </div>

                  </div>

                  <div>

                    <p className="ra-verdict-label">
                      Match score
                    </p>

                    <p className="ra-verdict-text">
                      {result.final_verdict}
                    </p>

                    {candidateName && (
                      <p className="ra-candidate">
                        {candidateName}
                      </p>
                    )}

                    <span
                      className={
                        `ra-badge ${
                          result.experience_requirement_met
                            ? "yes"
                            : "no"
                        }`
                      }
                    >
                      {result.experience_requirement_met
                        ? "Meets experience requirement"
                        : "Below experience requirement"}
                    </span>

                  </div>

                </div>


                {result.missing_important_skills?.length > 0 && (

                  <div className="ra-section">

                    <p
                      className="ra-section-title"
                      style={{ color: "#F0846F" }}
                    >
                      Missing important skills
                    </p>

                    <div className="ra-chip-row">

                      {result.missing_important_skills.map(
                        (skill, index) => (
                          <span
                            className="ra-chip missing"
                            key={index}
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>

                  </div>

                )}


                {result.keyword_suggestions?.length > 0 && (

                  <div className="ra-section">

                    <p
                      className="ra-section-title"
                      style={{ color: "var(--amber)" }}
                    >
                      Keywords to consider
                    </p>

                    <div className="ra-chip-row">

                      {result.keyword_suggestions.map(
                        (skill, index) => (
                          <span
                            className="ra-chip suggest"
                            key={index}
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>

                  </div>

                )}


                {result.matching_skills?.length > 0 && (

                  <div className="ra-section">

                    <p
                      className="ra-section-title"
                      style={{ color: "var(--highlighter)" }}
                    >
                      Already covered
                    </p>

                    <div className="ra-chip-row">

                      {result.matching_skills.map(
                        (skill, index) => (
                          <span
                            className="ra-chip match"
                            key={index}
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>

                  </div>

                )}


                <div className="ra-section">

                  <p className="ra-section-title">
                    Verdict
                  </p>

                  <p className="ra-feedback">
                    {result.final_verdict}
                  </p>

                </div>

              </>
            )}


            {status === "error" && (

              <div className="ra-empty">

                <div className="ra-empty-mark">
                  !
                </div>

                <p className="ra-empty-text">
                  {errorMsg}
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}