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
    { name: "Mock Interview", to: "/interview" },
    ...(!token ? [{ name: "Login", to: "/login" }, { name: "Register", to: "/register" }] : []),
    ...(token ? [{ name: "Dashboard", to: "/dashboard" }] : []),
    ...(token ? [{ name: "Generate Interview", to: "/generate-interview" }] : []),
    ...(token ? [{ name: "My Interviews", to: "/my-interviews" }] : []),
  ];

  return (
    <nav className="navbar fixed w-full top-0 z-50 bg-black text-white shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-6">
        {/* Left - Logo */}
        <div>
          <h1 className="text-2xl font-bold tracking-wide">
            InterviewPrep
          </h1>
        </div>

        {/* Right - All navigation components */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="hover:text-blue-400 transition font-medium no-underline"
          >
            Home
          </Link>
          <Link
            to="/interview"
            className="hover:text-blue-400 transition font-medium no-underline"
          >
            Mock Interview
          </Link>
          {token && (
            <>
              <Link
                to="/dashboard"
                className="hover:text-blue-400 transition font-medium no-underline"
              >
                Dashboard
              </Link>
              <Link
                to="/generate-interview"
                className="hover:text-blue-400 transition font-medium no-underline"
              >
                Generate Interview
              </Link>
              <Link
                to="/my-interviews"
                className="hover:text-blue-400 transition font-medium no-underline"
              >
                My Interviews
              </Link>
            </>
          )}
          {!token && (
            <>
              <Link
                to="/login"
                className="hover:text-blue-400 transition font-medium no-underline"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hover:text-blue-400 transition font-medium no-underline"
              >
                Register
              </Link>
            </>
          )}
          {token && (
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition"
            >
              Logout
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
