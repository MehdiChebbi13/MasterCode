"use client";

import { useState } from "react";
import { SummaryReader } from "./SummaryReader";
import type { Summary } from "@/types";

const COLORS = [
  { bg: "var(--ds-yellow)", rotate: "-0.8deg" },
  { bg: "var(--sky)", rotate: "0.8deg" },
];

export function SummariesGrid({
  summaries,
  courseName = "Course",
  onOpenFlashcards,
}: {
  summaries: Summary[];
  courseName?: string;
  onOpenFlashcards?: () => void;
}) {
  const [reading, setReading] = useState<Summary | null>(null);

  if (summaries.length === 0) {
    return (
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "60px 40px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 18, color: "var(--ink-soft)" }}>
          No summaries yet. Time to create one!
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "24px 40px 80px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-bricolage), serif",
              fontWeight: 700,
              fontSize: 32,
              letterSpacing: "-0.025em",
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              color: "var(--ink)",
            }}
          >
            The{" "}
            <span style={{ color: "var(--algo-deep)", fontStyle: "italic" }}>
              long form
            </span>{" "}
            stuff
          </h2>
          <div
            style={{
              fontSize: 13,
              color: "var(--ink-faint)",
              display: "inline-flex",
            }}
          >
            Tap any summary to read in full
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          {summaries.map((summary, i) => {
            const colorTheme = COLORS[i % COLORS.length];
            const isNew = i === 0;

            return (
              <article
                key={summary.id}
                onClick={() => setReading(summary)}
                style={{
                  position: "relative",
                  border: "2.5px solid var(--ink)",
                  borderRadius: 18,
                  padding: 28,
                  boxShadow: "var(--shadow)",
                  transition:
                    "transform 0.2s cubic-bezier(.2,.9,.3,1.2), box-shadow 0.2s ease",
                  cursor: "pointer",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  minHeight: 280,
                  background: colorTheme.bg,
                  transform: `rotate(${colorTheme.rotate})`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = `rotate(0deg) translate(-3px, -3px)`;
                  e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = `rotate(${colorTheme.rotate})`;
                  e.currentTarget.style.boxShadow = "var(--shadow)";
                }}
              >
                {/* Dot pattern */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, rgba(26, 22, 18, 0.07) 1px, transparent 0)",
                    backgroundSize: "14px 14px",
                    pointerEvents: "none",
                    opacity: 0.5,
                  }}
                />

                {/* Sticker */}
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    right: 18,
                    background: isNew ? "var(--ds-mint)" : "var(--ds-pink)",
                    color: "var(--ink)",
                    border: "2.5px solid var(--ink)",
                    padding: "5px 10px",
                    borderRadius: 999,
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    transform: isNew ? "rotate(-6deg)" : "rotate(8deg)",
                    boxShadow: "2px 2px 0 var(--ink)",
                    zIndex: 2,
                  }}
                >
                  {isNew ? "✦ NEW" : "⌚ READ"}
                </div>

                {/* Head */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      background: "var(--ink)",
                      color: "#fff",
                      padding: "4px 10px",
                      borderRadius: 6,
                      transform: "rotate(-2deg)",
                    }}
                  >
                    § {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 11,
                      color: "var(--ink-soft)",
                      fontWeight: 600,
                    }}
                  >
                    {i === 0
                      ? "Today"
                      : i === 1
                        ? "Yesterday"
                        : `${i} days ago`}
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "var(--font-bricolage), serif",
                    fontWeight: 700,
                    fontSize: 26,
                    letterSpacing: "-0.025em",
                    lineHeight: 1.05,
                    position: "relative",
                    zIndex: 1,
                    color: "var(--ink)",
                  }}
                >
                  {summary.title}
                </h3>

                {/* Preview */}
                <p
                  style={{
                    fontSize: 14.5,
                    color: "var(--ink)",
                    opacity: 0.82,
                    position: "relative",
                    zIndex: 1,
                    lineHeight: 1.55,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {summary.contentMarkdown
                    .substring(0, 150)
                    .replace(/[#*_`-]/g, "")}
                  ...
                </p>

                {/* Footer */}
                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "relative",
                    zIndex: 1,
                    paddingTop: 12,
                    borderTop: "2px dashed rgba(26,22,18,0.25)",
                  }}
                >
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: 10.5,
                        fontWeight: 600,
                        background: "#fff",
                        border: "2px solid var(--ink)",
                        padding: "3px 8px",
                        borderRadius: 999,
                        color: "var(--ink)",
                      }}
                    >
                      Notes
                    </span>
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "var(--ink)",
                      color: "#fff",
                      padding: "7px 13px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                    }}
                  >
                    Read →
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {reading && (
        <SummaryReader
          summary={reading}
          open={true}
          onOpenChange={(open) => !open && setReading(null)}
          courseName={courseName}
          allSummaries={summaries}
          onNavigate={setReading}
          onOpenFlashcards={() => { setReading(null); onOpenFlashcards?.(); }}
        />
      )}
    </>
  );
}
