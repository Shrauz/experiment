import React, { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
    document.body.className = saved || "dark";
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors duration-200 text-2xl border border-gray-600"
    >
      {theme === "dark" ? "🌞" : "🌙"}
    </button>
  );
}
