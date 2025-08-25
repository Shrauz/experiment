import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";

export default function Dashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      navigate("/login");
    } else {
      setToken(savedToken);
    }
  }, [navigate]);

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

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

      {/* ✅ Token card with smaller width */}
      {token && (
        <div className="card" style={{ marginTop: 20, maxWidth: "600px" }}>
          <p style={{ wordBreak: "break-all", fontSize: 14 }}>
            <strong>Your Auth Token:</strong> {token}
          </p>
        </div>
      )}
    </div>
  );
}
