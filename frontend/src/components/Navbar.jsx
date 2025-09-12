// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <nav className="navbar-container">
      {/* Left: Logo */}
      <div className="nav-left">
        <h2 className="logo">InterviewPrep</h2>
      </div>

      {/* Hamburger Button */}
      <button
        className={`hamburger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Links for wider screens
      <div className="nav-links">
        <Link to="/">Home</Link>
        {token && <Link to="/dashboard">Dashboard</Link>}
        {!token && <Link to="/login">Login</Link>}
        {!token && <Link to="/register">Register</Link>}
        {token && <Link to="/generate-interview">Generate Interview</Link>}
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
      </div> */}

      {/* Right: Theme Toggle */}
      <div className="nav-right">
        <ThemeToggle />
      </div>

      {/* Slide-out Menu for mobile */}
      <div className={`menu ${isOpen ? "open" : ""}`}>
        <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
        {token && <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>}
        {!token && <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>}
        {!token && <Link to="/register" onClick={() => setIsOpen(false)}>Register</Link>}
        {token && <Link to="/generate-interview" onClick={() => setIsOpen(false)}>Generate Interview</Link>}
        <Link to="/interview" onClick={() => setIsOpen(false)}>Mock Interview</Link>
        {token && (
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
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
    </nav>
  );
}
