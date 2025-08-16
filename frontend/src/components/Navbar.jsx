import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2 className="logo">InterviewPrep</h2>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/interview">Mock Interview</Link>
      </div>
      <div className="nav-right">
        <ThemeToggle />
      </div>
    </nav>
  );
}
