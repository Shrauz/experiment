import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition"
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
