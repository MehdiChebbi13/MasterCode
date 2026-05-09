"use client";

import { useRef, useEffect, useState } from "react";

export function LanguageSwitcher({
  language,
  onLanguageChange,
}: {
  language: "java" | "python";
  onLanguageChange: (lang: "java" | "python") => void;
}) {
  const javaRef = useRef<HTMLButtonElement>(null);
  const pythonRef = useRef<HTMLButtonElement>(null);
  const [indicator, setIndicator] = useState({ left: 5, width: 0 });

  useEffect(() => {
    const btn = language === "java" ? javaRef.current : pythonRef.current;
    if (!btn) return;
    const parent = btn.parentElement;
    if (!parent) return;
    const pr = parent.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    setIndicator({ left: br.left - pr.left, width: br.width });
  }, [language]);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        background: "var(--paper)",
        border: "2.5px solid var(--ink)",
        borderRadius: 14,
        padding: 5,
        boxShadow: "6px 6px 0 var(--ink)",
      }}
    >
      {/* Sliding indicator */}
      <div
        style={{
          position: "absolute",
          top: 5,
          bottom: 5,
          left: indicator.left,
          width: indicator.width,
          background: "var(--ink)",
          borderRadius: 9,
          transition: "left 0.32s cubic-bezier(.5,1.6,.4,1), width 0.32s cubic-bezier(.5,1.6,.4,1)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <button
        ref={javaRef}
        onClick={() => onLanguageChange("java")}
        style={{
          position: "relative",
          zIndex: 1,
          background: "transparent",
          border: "none",
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: language === "java" ? "var(--paper)" : "var(--ink)",
          padding: "9px 18px",
          borderRadius: 9,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          transition: "color 0.32s ease",
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            border: `2px solid ${language === "java" ? "var(--paper)" : "var(--ink)"}`,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 800,
            background: language === "java" ? "transparent" : "#ff8c5a",
            transition: "background 0.32s ease, border-color 0.32s ease",
          }}
        >
          J
        </span>
        Java
      </button>

      <button
        ref={pythonRef}
        onClick={() => onLanguageChange("python")}
        style={{
          position: "relative",
          zIndex: 1,
          background: "transparent",
          border: "none",
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: language === "python" ? "var(--paper)" : "var(--ink)",
          padding: "9px 18px",
          borderRadius: 9,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          transition: "color 0.32s ease",
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            border: `2px solid ${language === "python" ? "var(--paper)" : "var(--ink)"}`,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 800,
            background: language === "python" ? "transparent" : "#5fb8e8",
            transition: "background 0.32s ease, border-color 0.32s ease",
          }}
        >
          Py
        </span>
        Python
      </button>
    </div>
  );
}
