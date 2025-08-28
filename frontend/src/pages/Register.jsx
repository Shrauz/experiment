import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle"; // ✅ existing theme toggle

export default function Register() {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Registration failed");
        return;
      }

      navigate("/login");
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  }

  return (
    <div className="page-container">
      <div className="mini-navbar">
              <span onClick={() => navigate("/")} title="Home">
                🏠 Home
              </span>
              <ThemeToggle />
      </div>
      <div className="card">
        <h1 style={{ marginBottom: 16 }}>Create Account</h1>
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 12, textAlign: "left" }}
        >
          <input
            placeholder="Username:"
            value={username}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
          <input
            placeholder="Email:"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
          <button type="submit">Register</button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <p style={{ marginTop: 16 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
