"use client";

import { useRef, useEffect, useState } from "react";
import { tokenize, type TokenType } from "@/lib/syntaxHighlighter";

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: "#6d3afc",
  string:  "#8b6914",
  comment: "#8a8275",
  number:  "#c2410c",
  function:"#0891b2",
  type:    "#4d7c0f",
  plain:   "#1a1612",
};

export function EditorPanel({
  code,
  onCodeChange,
  language,
  filename,
  meta,
  onRun,
  onReset,
  isRunning,
}: {
  code: string;
  onCodeChange: (code: string) => void;
  language: "java" | "python";
  filename: string;
  meta: string;
  onRun: () => void;
  onReset: () => void;
  isRunning: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [currentLine, setCurrentLine] = useState(1);
  const [copyLabel, setCopyLabel] = useState("Copy");

  const lines = code.split("\n");
  const lineCount = lines.length;
  const tokens = tokenize(code, language);

  useEffect(() => {
    const ta = textareaRef.current;
    const pre = preRef.current;
    if (!ta || !pre) return;
    const onScroll = () => {
      pre.style.top = `-${ta.scrollTop}px`;
    };
    ta.addEventListener("scroll", onScroll);
    return () => ta.removeEventListener("scroll", onScroll);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.slice(0, start) + "    " + code.slice(end);
      onCodeChange(next);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      }, 0);
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onRun();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      textareaRef.current?.select();
      document.execCommand("copy");
    }
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy"), 1400);
  };

  const updateCurrentLine = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const before = code.slice(0, ta.selectionStart);
    setCurrentLine(before.split("\n").length);
  };

  const langColor = language === "java" ? "#ff8c5a" : "#5fb8e8";

  return (
    <div
      style={{
        background: "var(--paper)",
        border: "2.5px solid var(--ink)",
        borderRadius: 18,
        boxShadow: "10px 10px 0 var(--ink)",
        overflow: "hidden",
        position: "relative",
        transform: "rotate(-0.4deg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sticker */}
      <span
        style={{
          position: "absolute",
          top: -12,
          right: 22,
          background: "var(--ds-mint)",
          color: "var(--ink)",
          border: "2.5px solid var(--ink)",
          padding: "5px 10px",
          borderRadius: 999,
          fontSize: 10.5,
          fontWeight: 800,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          transform: "rotate(8deg)",
          boxShadow: "2px 2px 0 var(--ink)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        ⚡ LIVE
      </span>

      {/* Panel tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2.5px solid var(--ink)",
          background: "var(--cream-deep)",
          padding: "0 16px 0 0",
        }}
      >
        {/* File tab */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 20px",
            background: "var(--paper)",
            borderRight: "2.5px solid var(--ink)",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          {/* Traffic lights */}
          <span style={{ display: "inline-flex", gap: 6 }}>
            {["#ff6b6b", "var(--ds-yellow)", "var(--ds-mint)"].map((c, i) => (
              <span
                key={i}
                style={{
                  width: 11,
                  height: 11,
                  border: "1.5px solid var(--ink)",
                  borderRadius: "50%",
                  background: c,
                }}
              />
            ))}
          </span>
          {/* Lang dot */}
          <span
            style={{
              width: 11,
              height: 11,
              border: "2px solid var(--ink)",
              borderRadius: "50%",
              background: langColor,
            }}
          />
          {filename}
        </div>

        {/* Editor tools */}
        <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <ToolBtn onClick={handleCopy}>{copyLabel}</ToolBtn>
          <ToolBtn onClick={onReset}>↺ Reset</ToolBtn>
        </div>
      </div>

      {/* Editor body */}
      <div
        style={{
          position: "relative",
          background: "var(--paper)",
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(26, 22, 18, 0.06) 1px, transparent 0)",
          backgroundSize: "22px 22px",
          minHeight: 460,
          maxHeight: 560,
          overflow: "hidden",
          flex: 1,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "52px 1fr", height: "100%" }}>
          {/* Gutter */}
          <div
            style={{
              background: "rgba(244, 230, 191, 0.55)",
              borderRight: "1.5px dashed rgba(26,22,18,0.18)",
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 13.5,
              lineHeight: 1.65,
              color: "var(--ink-faint)",
              padding: "18px 0",
              textAlign: "right",
              userSelect: "none",
              overflowY: "hidden",
            }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div
                key={i}
                style={{
                  paddingRight: 14,
                  color: i + 1 === currentLine ? "var(--ink)" : undefined,
                  fontWeight: i + 1 === currentLine ? 700 : undefined,
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code wrap */}
          <div style={{ position: "relative", overflow: "hidden" }}>
            {/* Highlight overlay */}
            <pre
              ref={preRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                margin: 0,
                padding: "18px 22px",
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 13.5,
                lineHeight: 1.65,
                whiteSpace: "pre",
                wordWrap: "normal",
                color: "var(--ink)",
                background: "transparent",
                pointerEvents: "none",
                zIndex: 1,
                overflow: "visible",
              }}
            >
              <code>
                {tokens.map((tok, i) => (
                  <span key={i} style={{ color: TOKEN_COLORS[tok.type] }}>
                    {tok.value}
                  </span>
                ))}
              </code>
            </pre>

            {/* Editable textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={e => onCodeChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={updateCurrentLine}
              onClick={updateCurrentLine}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                margin: 0,
                padding: "18px 22px",
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 13.5,
                lineHeight: 1.65,
                background: "transparent",
                color: "transparent",
                caretColor: "var(--algo-deep)",
                border: "none",
                outline: "none",
                resize: "none",
                zIndex: 2,
                overflow: "auto",
                whiteSpace: "pre",
                tabSize: 4,
              }}
            />
          </div>
        </div>
      </div>

      {/* Run strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "2.5px solid var(--ink)",
          background: "var(--cream-deep)",
          padding: "14px 18px",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 11.5,
            color: "var(--ink-soft)",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              background: "var(--ds-mint)",
              border: "1.5px solid var(--ink)",
              borderRadius: "50%",
            }}
          />
          Ready · {meta}
        </div>

        <button
          onClick={onRun}
          disabled={isRunning}
          style={{
            background: isRunning ? "var(--ink-faint)" : "var(--ink)",
            color: "var(--paper)",
            border: `2.5px solid ${isRunning ? "var(--ink-faint)" : "var(--ink)"}`,
            borderRadius: 11,
            padding: "11px 22px",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontWeight: 700,
            fontSize: 15,
            cursor: isRunning ? "wait" : "pointer",
            boxShadow: isRunning ? "3px 3px 0 var(--ink)" : "6px 6px 0 var(--ink)",
            transition: "transform 0.12s ease, box-shadow 0.12s ease, background 0.2s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
          }}
          onMouseEnter={e => {
            if (isRunning) return;
            (e.currentTarget as HTMLButtonElement).style.transform = "translate(-2px, -2px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "8px 8px 0 var(--ink)";
            (e.currentTarget as HTMLButtonElement).style.background = "var(--algo-deep)";
          }}
          onMouseLeave={e => {
            if (isRunning) return;
            (e.currentTarget as HTMLButtonElement).style.transform = "none";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "6px 6px 0 var(--ink)";
            (e.currentTarget as HTMLButtonElement).style.background = "var(--ink)";
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              background: "var(--ds-mint)",
              border: "2px solid var(--paper)",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              fontSize: 9,
            }}
          >
            ▶
          </span>
          {isRunning ? "Running…" : "Run code"}
          {!isRunning && (
            <kbd
              style={{
                fontFamily: "inherit",
                fontSize: 10,
                opacity: 0.7,
                marginLeft: 4,
                padding: "2px 6px",
                background: "rgba(255,255,255,0.12)",
                borderRadius: 4,
              }}
            >
              ⌘ ↵
            </kbd>
          )}
        </button>
      </div>
    </div>
  );
}

function ToolBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "var(--paper)",
        border: "2px solid var(--ink)",
        borderRadius: 8,
        padding: "5px 9px",
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "2px 2px 0 var(--ink)",
        transition: "transform 0.12s ease",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        color: "var(--ink)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translate(-1.5px, -1.5px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "3.5px 3.5px 0 var(--ink)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "none";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "2px 2px 0 var(--ink)";
      }}
    >
      {children}
    </button>
  );
}
