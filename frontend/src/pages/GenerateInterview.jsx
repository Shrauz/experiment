import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle"; // optional theme toggle

export default function GenerateInterview() {
  const [experience, setExperience] = useState("");
  const [field, setField] = useState("");
  const [languages, setLanguages] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authorization token is missing.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/generate-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ experience, field, languages: languages.join(", ") }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setQuestions(data.questions);
      setSuccessMsg("Interview generated successfully!");

      // Redirect after 2 seconds
      // setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setLanguages(selectedOptions);
  };

  return (
    <div className="page-container">
      {/* Main Card */}
      <div className="card" style={{ maxWidth: 600 }}>
        <h1 style={{ marginBottom: 16 }}>Interview Generator</h1>
        <form style={{ display: "grid", gap: 12 }} onSubmit={handleSubmit}>
          <select
            className="form-input"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            required
          >
            <option value="" disabled>
              Select experience level
            </option>
            <option value="Entry Level">Entry Level</option>
            <option value="1-3 years">1-3 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5+ years">5+ years</option>
          </select>

          <select
            className="form-input"
            value={field}
            onChange={(e) => setField(e.target.value)}
            required
          >
            <option value="" disabled>
              Select field
            </option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Data Science">Data Science</option>
            <option value="DevOps">DevOps</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="UX/UI Design">UX/UI Design</option>
          </select>

          <select
            multiple
            className="form-input"
            style={{ height: 120 }}
            value={languages}
            onChange={handleLanguageChange}
            required
          >
            <option value="Python">Python</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Java">Java</option>
            <option value="C++">C++</option>
            <option value="Go">Go</option>
            <option value="Rust">Rust</option>
          </select>

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate Interview"}
          </button>
        </form>

        {successMsg && (
          <div className="feedback bg-green-700 text-green-100 mt-4">{successMsg}</div>
        )}
        {error && <div className="feedback bg-red-800 text-red-200 mt-4">{error}</div>}

        {/* Optional display of generated questions */}
        {questions.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h2>Generated Questions:</h2>
            <ul style={{ paddingLeft: 20 }}>
              {questions.map((q, i) => (
                <li key={i}>
                  <strong>Q{i + 1}:</strong> {q.question_text} <br />
                  <em>Keywords:</em> {q.expected_answer_keywords}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
