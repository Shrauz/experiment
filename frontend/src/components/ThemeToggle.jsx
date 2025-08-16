import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  // Load saved theme on first render
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      setDark(saved === "dark");
      document.body.className = saved;
    }
  }, []);

  // Update body + save when dark changes
  useEffect(() => {
    const theme = dark ? "dark" : "light";
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [dark]);

  return (
    <button onClick={() => setDark(!dark)}>
      {dark ? "🌙" : "☀️"}
    </button>
  );
}
