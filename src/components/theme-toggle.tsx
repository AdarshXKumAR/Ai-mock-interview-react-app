import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export const ThemeToggle = () => {
  const [dark, setDark] = useState<boolean>(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    } else if (saved === "light") {
      setDark(false);
      document.documentElement.classList.remove("dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        outline: "none",
      }}
    >
      {/* pill track */}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          width: "3.25rem",
          height: "1.75rem",
          borderRadius: "9999px",
          background: dark ? "#1e293b" : "#f1f5f9",
          border: `1.5px solid ${dark ? "#475569" : "#cbd5e1"}`,
          boxShadow: "0 1px 6px rgba(0,0,0,0.10)",
          transition: "background 0.35s ease, border-color 0.35s ease",
          flexShrink: 0,
        }}
      >
        {/* sliding thumb — carries the single icon */}
        <span
          style={{
            position: "absolute",
            left: dark ? "calc(100% - 1.45rem)" : "0.18rem",
            width: "1.35rem",
            height: "1.35rem",
            borderRadius: "9999px",
            background: dark ? "#6366f1" : "#f59e0b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition:
              "left 0.38s cubic-bezier(0.34,1.56,0.64,1), background 0.35s ease",
            boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
          }}
        >
          {dark ? (
            <Moon
              key="moon"
              style={{
                width: "0.72rem",
                height: "0.72rem",
                color: "#fff",
                animation: "togglePopIn 0.35s ease",
              }}
            />
          ) : (
            <Sun
              key="sun"
              style={{
                width: "0.72rem",
                height: "0.72rem",
                color: "#fff",
                animation: "toggleSpinIn 0.4s ease",
              }}
            />
          )}
        </span>
      </span>

      <style>{`
        @keyframes toggleSpinIn {
          from { transform: rotate(-80deg) scale(0.4); opacity: 0; }
          to   { transform: rotate(0deg)  scale(1);   opacity: 1; }
        }
        @keyframes togglePopIn {
          from { transform: scale(0.3) rotate(15deg); opacity: 0; }
          to   { transform: scale(1)   rotate(0deg);  opacity: 1; }
        }
      `}</style>
    </button>
  );
};