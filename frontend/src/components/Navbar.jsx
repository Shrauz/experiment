import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2 className="logo">InterviewPrep</h2>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        {token && <Link to="/dashboard">Dashboard</Link>}
        {!token && <Link to="/login">Login</Link>}
        {!token && <Link to="/register">Register</Link>}
        <Link to="/interview">Mock Interview</Link>
        {token && (
          <button
            onClick={logout}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              fontSize: "inherit",
              padding: 0,
            }}
          >
            Logout
          </button>
        )}
      </div>

      <div className="nav-right">
        <ThemeToggle />
      </div>
    </nav>
  );
}
