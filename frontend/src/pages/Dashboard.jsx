import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";

export default function Dashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [expandedId, setExpandedId] = useState(null); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setToken(token);
      fetchInterviews(token);
    }
  }, [navigate]);


  const fetchInterviews = async (token) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/my-interviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInterviews(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="page-container">
      <div className="card">
        <h1 style={{ marginBottom: 20 }}>Dashboard</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => navigate("/interview")}>Start Interview</button>
          <button onClick={logout}>Logout</button>
          <Link to="/register">Register another user</Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Token card */}
      {token && (
        <div className="card" style={{ marginTop: 20, maxWidth: "600px" }}>
          <p style={{ wordBreak: "break-all", fontSize: 14 }}>
            <strong>Your Auth Token:</strong> {token}
          </p>
        </div>
      )}

      {/* Generated Interviews */}
      {interviews.length > 0 && (
        <div className="card" style={{ marginTop: 20, maxWidth: 600 }}>
          <h2>Your Generated Interviews</h2>
          {interviews.map((interview) => (
            <div
              key={interview.interview_id}
              style={{
                border: "1px solid #444",
                borderRadius: 6,
                marginTop: 12,
                cursor: "pointer",
                padding: 12,
              }}
              onClick={() =>
                setExpandedId(expandedId === interview.interview_id ? null : interview.interview_id)
              }
            >
              <p>
                <strong>Interview ID:</strong> {interview.interview_id}
              </p>

              {expandedId === interview.interview_id && (
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  {interview.questions.map((q) => (
                    <li key={q.id} style={{ marginBottom: 6 }}>
                      <strong>Q:</strong> {q.question_text} <br />
                      <em>Keywords:</em> {q.expected_answer_keywords}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
