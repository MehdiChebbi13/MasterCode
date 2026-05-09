"use client";

import { useEffect, useRef } from "react";
import type { OutputLineType, ConsoleLine } from "./ExampleChips";

export type { ConsoleLine, OutputLineType };

type Status = "idle" | "running" | "success" | "error";

const PULSE_COLORS: Record<Status, string> = {
  idle:    "var(--ink-faint)",
  running: "var(--ds-yellow)",
  success: "var(--ds-mint)",
  error:   "#ff6b6b",
};

const STATUS_LABELS: Record<Status, string> = {
  idle:    "Idle",
  running: "Running…",
  success: "Success",
  error:   "Error",
};

export function ConsolePanel({
  lines,
  status,
  stats,
  language,
  onClear,
}: {
  lines: ConsoleLine[];
  status: Status;
  stats: { time: string; mem: string; exit: string } | null;
  language: "java" | "python";
  onClear: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines]);

  let outIdx = 1;

  return (
    <div
      style={{
        background: "var(--paper)",
        border: "2.5px solid var(--ink)",
        borderRadius: 18,
        boxShadow: "10px 10px 0 var(--ink)",
        overflow: "hidden",
        position: "relative",
        transform: "rotate(0.4deg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sticker */}
      <span
        style={{
          position: "absolute",
          top: -12,
          left: 22,
          background: "var(--ds-yellow)",
          color: "var(--ink)",
          border: "2.5px solid var(--ink)",
          padding: "5px 10px",
          borderRadius: 999,
          fontSize: 10.5,
          fontWeight: 800,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          transform: "rotate(-7deg)",
          boxShadow: "2px 2px 0 var(--ink)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        ⌨️ TERMINAL
      </span>

      {/* Console head */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2.5px solid var(--ink)",
          background: "var(--cream-deep)",
          paddingRight: 14,
        }}
      >
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
          <span
            style={{
              width: 18,
              height: 18,
              background: "var(--ink)",
              color: "var(--ds-mint)",
              borderRadius: 4,
              display: "grid",
              placeItems: "center",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          >
            $
          </span>
          output.log
        </div>

        {/* Status indicator */}
        <div
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 11.5,
            fontWeight: 600,
            color: "var(--ink-soft)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              border: "1.5px solid var(--ink)",
              background: PULSE_COLORS[status],
              animation: status === "running" ? "sandboxBlink 0.8s ease-in-out infinite" : "none",
            }}
          />
          {STATUS_LABELS[status]}
        </div>
      </div>

      {/* Console body */}
      <div
        ref={bodyRef}
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          padding: "22px 24px",
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 13.5,
          lineHeight: 1.65,
          minHeight: 460,
          maxHeight: 560,
          overflowY: "auto",
          position: "relative",
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,245,220,0.04) 1px, transparent 0)",
          backgroundSize: "22px 22px",
          flex: 1,
        }}
      >
        {lines.length === 0 ? (
          <div
            style={{
              color: "rgba(255,245,220,0.5)",
              textAlign: "center",
              padding: "60px 20px 0",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-bricolage), serif",
                fontSize: 38,
                color: "var(--paper)",
                marginBottom: 12,
                letterSpacing: "-0.02em",
              }}
            >
              ↻ Press Run
            </div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 12,
                color: "rgba(255,245,220,0.45)",
                letterSpacing: "0.06em",
              }}
            >
              or hit{" "}
              <kbd
                style={{
                  background: "rgba(255,245,220,0.12)",
                  border: "1px solid rgba(255,245,220,0.3)",
                  borderRadius: 4,
                  padding: "2px 7px",
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 11,
                  color: "var(--paper)",
                }}
              >
                ⌘
              </kbd>{" "}
              +{" "}
              <kbd
                style={{
                  background: "rgba(255,245,220,0.12)",
                  border: "1px solid rgba(255,245,220,0.3)",
                  borderRadius: 4,
                  padding: "2px 7px",
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 11,
                  color: "var(--paper)",
                }}
              >
                ↵
              </kbd>{" "}
              to execute
            </div>
          </div>
        ) : (
          lines.map((ln, i) => {
            const isOut = ln.type === "out";
            const lineNum = isOut ? outIdx++ : null;
            const lnoContent =
              ln.type === "system" ? "·"
              : ln.type === "success" ? "✓"
              : ln.type === "error" ? "✗"
              : lineNum;

            let contentColor = "var(--paper)";
            if (ln.type === "system") contentColor = "var(--ds-yellow)";
            else if (ln.type === "success") contentColor = "var(--ds-mint)";
            else if (ln.type === "error") contentColor = "#ff8a8a";
            else if (ln.type === "muted") contentColor = "rgba(255,245,220,0.5)";

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  marginBottom: 2,
                  animation: "sandboxLineIn 0.2s ease both",
                }}
              >
                <span
                  style={{
                    color: "rgba(255,245,220,0.32)",
                    minWidth: 22,
                    textAlign: "right",
                    userSelect: "none",
                    flexShrink: 0,
                  }}
                >
                  {lnoContent}
                </span>
                <span
                  style={{
                    flex: 1,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    color: contentColor,
                    fontStyle: ln.type === "muted" ? "italic" : undefined,
                  }}
                >
                  {ln.type === "system" && (
                    <span style={{ color: "var(--ds-mint)", userSelect: "none" }}>
                      {language === "java" ? "⌘ " : "$ "}
                    </span>
                  )}
                  {ln.text}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Console foot */}
      <div
        style={{
          borderTop: "2.5px solid var(--ink)",
          background: "var(--cream-deep)",
          padding: "10px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--ink-soft)",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "inline-flex", gap: 6 }}>
          {[
            `⏱ ${stats?.time ?? "—"}`,
            `📦 ${stats?.mem ?? "—"}`,
            `↳ exit ${stats?.exit ?? "—"}`,
          ].map(label => (
            <span
              key={label}
              style={{
                background: "var(--paper)",
                border: "1.5px solid var(--ink)",
                borderRadius: 999,
                padding: "3px 10px",
                color: "var(--ink)",
                letterSpacing: "0.04em",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        <button
          onClick={onClear}
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
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            color: "var(--ink)",
            transition: "transform 0.12s ease",
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
          🗑 Clear
        </button>
      </div>
    </div>
  );
}
