import { useState } from "react";

const sampleQuestions = [
  "Tell me about yourself.",
  "Explain the difference between let, const, and var in JavaScript.",
];

export default function Interview() {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  function submitAnswer(e) {
    e.preventDefault();
    setFeedback("Good answer! (dummy feedback)");
  }

  function nextQ() {
    setAnswer("");
    setFeedback("");
    setIdx((i) => Math.min(i + 1, sampleQuestions.length - 1));
  }

  return (
    <div className="page interview">
      <h1 className="page-title">Mock Interview</h1>
      <p className="question">
        <b>Question {idx + 1}:</b> {sampleQuestions[idx]}
      </p>
      <form className="answer-form" onSubmit={submitAnswer}>
        <textarea
          rows={6}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer..."
        />
        <div className="form-buttons">
          <button type="submit" className="btn primary">Submit</button>
          <button type="button" className="btn secondary" onClick={nextQ}>Next</button>
        </div>
      </form>
      {feedback && (
        <div className="feedback">
          <b>Feedback:</b> {feedback}
        </div>
      )}
    </div>
  );
}
