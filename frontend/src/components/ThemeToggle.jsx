import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.style.backgroundColor = "#1C1C1C";
      document.documentElement.style.color = "white";
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.style.backgroundColor = "#ffffff";
      document.documentElement.style.color = "#1C1C1C";
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "1.2rem",
        transition: "opacity 0.3s ease",
        color: "inherit",
      }}
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
}
