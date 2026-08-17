import React, { useState, useRef } from "react";
import "./App.css";

const API_BASE_URL = "https://resume-analyser-gamma-one.vercel.app";

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

    const name = selectedFile.name.toLowerCase();

    if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
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
      setErrorMsg("Please upload your resume.");
      return;
    }

    setErrorMsg("");
    setStatus("scanning");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("job_description", jd);
      formData.append("resume", file);

      const response = await fetch(
        `${API_BASE_URL}/api/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        let message = "Analysis failed.";

        try {
          const errorData = await response.json();

          if (errorData?.detail) {
            message = errorData.detail;
          }
        } catch {
          // Ignore JSON parsing errors
        }

        throw new Error(message);
      }

      const data = await response.json();

      setResult(data.match);

      setCandidateName(
        data.match?.candidate_name ||
        data.resume?.name ||
        null
      );

      setStatus("done");
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error.message ||
        "Could not connect to the backend."
      );

      setStatus("error");
    }
  };

  const scoreColor = (score) => {
    if (score >= 75) return "#4FCB84";
    if (score >= 50) return "#E0A537";
    return "#DD4A34";
  };

  return (
    <div className="ra-root">

      <div className="ra-shell">

        {/* HEADER */}

        <header className="ra-header">

          <p className="ra-eyebrow">
            AI RESUME SCREENER
          </p>

          <h1 className="ra-title">
            Resume Analysis
          </h1>

          <p className="ra-sub">
            Paste the job description, upload your resume,
            and get an AI-powered ATS-style match score.
          </p>

        </header>


        <div className="ra-grid">

          {/* LEFT SIDE */}

          <div>

            {/* JOB DESCRIPTION */}

            <div
              className="ra-panel"
              style={{ marginBottom: "16px" }}
            >

              <div className="ra-panel-label">

                <span>
                  JOB DESCRIPTION
                </span>

                <span>
                  {
                    jd
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean)
                      .length
                  } words
                </span>

              </div>

              <textarea
                className="ra-input"
                placeholder="Paste the complete job description here..."
                value={jd}
                onChange={(e) =>
                  setJd(e.target.value)
                }
              />

            </div>


            {/* RESUME UPLOAD */}

            <div className="ra-panel">

              <div className="ra-panel-label">
                RESUME
              </div>

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

                {status === "scanning" && (
                  <div className="ra-scanline" />
                )}

                <div className="ra-drop-icon">
                  ↑
                </div>

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
                    Drop PDF or DOCX here
                    <br />
                    or click to browse
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


              {/* BUTTON */}

              <button
                className="ra-run-btn"
                onClick={runAnalysis}
                disabled={status === "scanning"}
              >

                {status === "scanning"
                  ? "SCANNING..."
                  : "RUN ANALYSIS →"}

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

            {/* EMPTY */}

            {status === "idle" && (

              <div className="ra-empty">

                <div className="ra-empty-mark">
                  0/100
                </div>

                <p className="ra-empty-text">
                  Results will appear here
                  after you run the analysis.
                </p>

              </div>

            )}


            {/* SCANNING */}

            {status === "scanning" && (

              <div className="ra-scanning">

                <div className="ra-pulse" />

                <p className="ra-scanning-text">
                  Comparing resume against
                  job description...
                </p>

              </div>

            )}


            {/* RESULTS */}

            {status === "done" && result && (

              <>

                {/* SCORE */}

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
                      MATCH SCORE
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
                        ? "EXPERIENCE REQUIREMENT MET"
                        : "EXPERIENCE REQUIREMENT NOT MET"}

                    </span>

                  </div>

                </div>


                {/* MISSING SKILLS */}

                {result.missing_important_skills?.length > 0 && (

                  <div className="ra-section">

                    <p
                      className="ra-section-title"
                      style={{
                        color: "#F0846F"
                      }}
                    >
                      MISSING IMPORTANT SKILLS
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


                {/* KEYWORDS */}

                {result.keyword_suggestions?.length > 0 && (

                  <div className="ra-section">

                    <p
                      className="ra-section-title"
                      style={{
                        color: "#E0A537"
                      }}
                    >
                      ATS KEYWORD SUGGESTIONS
                    </p>

                    <div className="ra-chip-row">

                      {result.keyword_suggestions.map(
                        (keyword, index) => (

                          <span
                            className="ra-chip suggest"
                            key={index}
                          >
                            {keyword}
                          </span>

                        )
                      )}

                    </div>

                  </div>

                )}


                {/* MATCHING SKILLS */}

                {result.matching_skills?.length > 0 && (

                  <div className="ra-section">

                    <p
                      className="ra-section-title"
                      style={{
                        color: "#6FCB9A"
                      }}
                    >
                      ALREADY COVERED
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


                {/* VERDICT */}

                <div className="ra-section">

                  <p className="ra-section-title">
                    VERDICT
                  </p>

                  <p className="ra-feedback">
                    {result.final_verdict}
                  </p>

                </div>

              </>

            )}


            {/* ERROR */}

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


        <p className="ra-footer-note">
          AI-generated guidance. This score does not
          guarantee ATS or recruiter outcomes.
        </p>

      </div>

    </div>
  );
}
