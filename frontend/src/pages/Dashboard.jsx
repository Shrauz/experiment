import { useNavigate, Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function Dashboard() {
  const navigate = useNavigate();

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
    </div>
  );
}
