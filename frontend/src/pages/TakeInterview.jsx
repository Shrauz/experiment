import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VoiceInterview from "../components/VoiceInterview";
import ThemeToggle from "../components/ThemeToggle";

export default function TakeInterview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { questions, interview_id } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(0);

  if (!questions || questions.length === 0) {
    return (
      <div className="page-container">
        <div className="card">
          <h2>No questions found for this interview.</h2>
          <ThemeToggle />
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("Interview completed!");
      navigate("/user-interviews"); // Go back to list page
    }
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
        <h2>Interview ID: {interview_id}</h2>
        <p>
          Question {currentIndex + 1} of {questions.length}
        </p>

        {/* VoiceInterview component */}
        <VoiceInterview question={currentQuestion} />

        <button
          onClick={handleNext}
          style={{
            marginTop: 20,
            padding: "8px 12px",
            borderRadius: 6,
            backgroundColor: "#3b82f6",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          {currentIndex < questions.length - 1 ? "Next Question" : "Finish Interview"}
        </button>

        <ThemeToggle />
      </div>
    </div>
  );
}
