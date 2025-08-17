// src/pages/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page-container">
      <div className="card">
        <h1 className="page-title">Welcome to InterviewPrep 🎯</h1>
        <p className="question">
          Practice mock interviews, improve your answers, and get AI-powered feedback.
        </p>

        <div className="form-buttons" style={{ marginTop: "16px" }}>
          <Link to="/login">
            <button>Login</button>
          </Link>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
