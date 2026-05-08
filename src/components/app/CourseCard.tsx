"use client";

import Link from "next/link";
import type { CourseWithStats } from "@/types";
import { pluralize } from "@/lib/format";

const CARD_THEMES = [
  { bg: "#cbb6ff", fill: "#6d3afc", rotate: "-1.2deg" },
  { bg: "#9be8f5", fill: "#0891b2", rotate: "0.8deg" },
  { bg: "#c6f56b", fill: "#4d7c0f", rotate: "-0.6deg" },
  { bg: "#ffb37c", fill: "#c2410c", rotate: "1.4deg" },
] as const;

const STICKERS: (null | { label: string; bg: string })[] = [
  { label: "🔥 ON A ROLL", bg: "#ff6b9d" },
  null,
  { label: "⭐ FAVORITE", bg: "#fcc419" },
  { label: "✦ NEW", bg: "#66d9a6" },
];

export function CourseCard({ course, index }: { course: CourseWithStats; index: number }) {
  const theme = CARD_THEMES[index % CARD_THEMES.length];
  const sticker = index < STICKERS.length ? STICKERS[index] : null;
  const progress = Math.min(course.flashcardCount * 9, 88);

  return (
    <Link
      href={`/courses/${course.id}`}
      className="neo-card animate-float-up block"
      style={
        {
          "--card-rotate": theme.rotate,
          backgroundColor: theme.bg,
          animationDelay: `${0.05 + index * 0.08}s`,
          padding: 26,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          minHeight: 310,
          textDecoration: "none",
          color: "var(--ink)",
        } as React.CSSProperties
      }
      aria-label={`Open ${course.name}`}
    >
      {/* Sticker badge */}
      {sticker && (
        <span
          style={{
            position: "absolute",
            top: -10,
            right: 18,
            background: sticker.bg,
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
            zIndex: 2,
          }}
        >
          {sticker.label}
        </span>
      )}

      {/* Card header: icon + code pill */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, position: "relative", zIndex: 1 }}>
        <div
          style={{
            width: 56,
            height: 56,
            border: "2.5px solid var(--ink)",
            borderRadius: 14,
            background: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 28,
            boxShadow: "var(--shadow-sm)",
            flexShrink: 0,
          }}
        >
          {course.emoji ?? "📚"}
        </div>
        <span
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "5px 10px",
            borderRadius: 6,
            alignSelf: "flex-start",
            transform: "rotate(3deg)",
            boxShadow: "2px 2px 0 rgba(0,0,0,0.15)",
            whiteSpace: "nowrap",
          }}
        >
          {course.code}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "var(--font-bricolage), serif",
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
          position: "relative",
          zIndex: 1,
        }}
      >
        {course.name}
      </h3>

      {/* Description */}
      {course.description && (
        <p
          style={{
            fontSize: 14.5,
            color: "var(--ink)",
            opacity: 0.78,
            position: "relative",
            zIndex: 1,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {course.description}
        </p>
      )}

      {/* Progress + meta */}
      <div style={{ marginTop: "auto", position: "relative", zIndex: 1 }}>
        {/* Progress track */}
        <div
          style={{
            height: 10,
            background: "rgba(26,22,18,0.15)",
            border: "2px solid var(--ink)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: theme.fill,
              borderRight: progress > 0 ? "2px solid var(--ink)" : undefined,
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,250,239,0.35) 0, rgba(255,250,239,0.35) 6px, transparent 6px, transparent 12px)",
            }}
          />
        </div>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <StatMini
              icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                </svg>
              }
              label={pluralize(course.flashcardCount, "card")}
            />
            <StatMini
              icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              }
              label={pluralize(course.summaryCount, "summary", "summaries")}
            />
          </div>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--ink)",
              color: "var(--paper)",
              padding: "7px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.02em",
              border: "2px solid var(--ink)",
              transition: "transform 0.15s ease",
            }}
          >
            {progress === 0 ? "Start →" : "Continue →"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function StatMini({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--ink)" }}>
      {icon}
      {label}
    </span>
  );
}
