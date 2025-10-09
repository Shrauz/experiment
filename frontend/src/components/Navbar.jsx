import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const links = [
    { name: "Home", to: "/" },
    ...(token ? [{ name: "Dashboard", to: "/dashboard" }] : []),
    ...(token ? [{ name: "Generate Interview", to: "/generate-interview" }] : []),
    ...(token ? [{ name: "My Interviews", to: "/my-interviews" }] : []), // ✅ New link
    { name: "Mock Interview", to: "/interview" },
    ...(!token ? [{ name: "Login", to: "/login" }, { name: "Register", to: "/register" }] : []),
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <h2 className="nav-logo">InterviewPrep</h2>

        {/* Navigation Links */}
        <div className="nav-links">
          {links.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.name}
            </Link>
          ))}

          {token && (
            <button onClick={logout}>
              Logout
            </button>
          )}

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
