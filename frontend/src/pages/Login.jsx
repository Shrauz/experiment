import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle"; // ✅ existing theme toggle

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        navigate("/dashboard");
      } else {
        alert(data.msg || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  }

  return (
    <div className="page-container">
      {/* ✅ mini top navbar */}
      <div className="mini-navbar">
        <span onClick={() => navigate("/")} title="Home">
          🏠 Home
        </span>
        <ThemeToggle />
      </div>

      <div className="card">
        <h1 style={{ marginBottom: 16 }}>Login</h1>
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 12, textAlign: "left" }}
        >
          <input
            placeholder="Email"
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
          <button type="submit">Sign in</button>
        </form>
        <p style={{ marginTop: 16 }}>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
