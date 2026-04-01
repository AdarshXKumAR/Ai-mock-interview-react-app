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

  // Sync with system preference on first load
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
          height: "1.65rem",
          borderRadius: "9999px",
          background: dark ? "#1e293b" : "#f1f5f9",
          border: `1.5px solid ${dark ? "#475569" : "#cbd5e1"}`,
          boxShadow: "0 1px 6px rgba(0,0,0,0.10)",
          transition: "background 0.35s ease, border-color 0.35s ease",
          flexShrink: 0,
        }}
      >
        {/* sliding thumb */}
        <span
          style={{
            position: "absolute",
            left: dark ? "calc(100% - 1.4rem)" : "0.17rem",
            width: "1.28rem",
            height: "1.28rem",
            borderRadius: "9999px",
            background: dark ? "#6366f1" : "#f59e0b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "left 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.35s ease",
            boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
            zIndex: 2,
          }}
        >
          {dark ? (
            <Moon
              style={{
                width: "0.7rem",
                height: "0.7rem",
                color: "#fff",
                animation: "themePopIn 0.35s ease",
              }}
            />
          ) : (
            <Sun
              style={{
                width: "0.7rem",
                height: "0.7rem",
                color: "#fff",
                animation: "themeSpinIn 0.4s ease",
              }}
            />
          )}
        </span>

        {/* ghost icons in track bg */}
        <Moon
          style={{
            position: "absolute",
            left: "0.28rem",
            width: "0.65rem",
            height: "0.65rem",
            color: dark ? "#334155" : "#94a3b8",
            zIndex: 1,
            transition: "color 0.3s",
          }}
        />
        <Sun
          style={{
            position: "absolute",
            right: "0.28rem",
            width: "0.65rem",
            height: "0.65rem",
            color: dark ? "#334155" : "#94a3b8",
            zIndex: 1,
            transition: "color 0.3s",
          }}
        />
      </span>

      <style>{`
        @keyframes themeSpinIn {
          from { transform: rotate(-80deg) scale(0.4); opacity: 0; }
          to   { transform: rotate(0deg) scale(1);   opacity: 1; }
        }
        @keyframes themePopIn {
          from { transform: scale(0.3) rotate(15deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg);   opacity: 1; }
        }
      `}</style>
    </button>
  );
};