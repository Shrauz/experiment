import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function UserInterviews() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalQuestions, setModalQuestions] = useState([]);

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

  // Modal open handler
  const handleViewAnswers = (questions) => {
    setModalQuestions(questions);
    setShowModal(true);
  };

  // Modal close handler
  const handleCloseModal = () => {
    setShowModal(false);
    setModalQuestions([]);
  };

  return (
    <div className="page-container">
      <div className="card">
        <h1 style={{ marginBottom: 20 }}>My Generated Interviews</h1>
        <ThemeToggle />
      </div>

      {interviews.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
          {interviews.map((interview) => (
            <div
              key={interview.interview_id}
              style={{
                border: "1px solid",
                borderRadius: 8,
                padding: 16,
                cursor: "pointer",
              }}
              onClick={() =>
                setExpandedId(expandedId === interview.interview_id ? null : interview.interview_id)
              }
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p><strong>Interview ID:</strong> {interview.interview_id}</p>
                  <p><strong>Total Questions:</strong> {interview.questions.length}</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card toggle
                      navigate("/take-interview", {
                        state: {
                          questions: interview.questions,
                          interview_id: interview.interview_id
                        }
                      });
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      backgroundColor: "#3b82f6",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Take Interview
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewAnswers(interview.questions);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      backgroundColor: "#10b981",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    View Answers
                  </button>
                </div>
              </div>
              {expandedId === interview.interview_id && (
                <ul style={{ paddingLeft: 20, marginTop: 12 }}>
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
      ) : (
        <p style={{ marginTop: 20 }}>No interviews generated yet.</p>
      )}

      {/* Simple Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "10px",
              padding: "24px",
              minWidth: "350px",
              maxWidth: "95vw",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 16 }}>Expected Answers</h2>
            <ul style={{ paddingLeft: 0, marginBottom: 16 }}>
              {modalQuestions.map((q) => (
                <li key={q.id} style={{ marginBottom: 12 }}>
                  <strong>Q:</strong> {q.question_text} <br />
                  <strong>Expected Answer Keywords:</strong>
                  <span style={{ marginLeft: 8 }}>{q.expected_answer_keywords}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleCloseModal}
              style={{
                padding: "8px 20px",
                borderRadius: 6,
                backgroundColor: "#ef4444",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}