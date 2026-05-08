"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { CourseDialog } from "./CourseDialog";
import { DeleteCourseConfirm } from "./DeleteCourseConfirm";
import type { Course } from "@/types";

const COLORS: Record<string, string> = {
  algo: "#cbb6ff",
  os: "#9be8f5",
  db: "#c6f56b",
  net: "#ffb37c",
};

function getColorForCourse(course: Course): string {
  const colors = Object.values(COLORS);
  const hash = course.id.charCodeAt(0) + course.id.charCodeAt(1);
  return colors[hash % colors.length];
}

export function CourseHeader({ course }: { course: Course }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const color = getColorForCourse(course);

  return (
    <>
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "36px 40px 16px",
          position: "relative",
        }}
      >
        {/* Back link */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink-soft)",
            textDecoration: "none",
            marginBottom: 24,
            transition: "gap 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.gap = "12px";
            e.currentTarget.style.color = "var(--ink)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.gap = "8px";
            e.currentTarget.style.color = "var(--ink-soft)";
          }}
        >
          <ChevronLeft size={14} />
          All courses
        </Link>

        {/* Course banner */}
        <div
          style={{
            background: color,
            border: "2.5px solid var(--ink)",
            borderRadius: 22,
            padding: "28px 32px",
            boxShadow: "var(--shadow-lg)",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: 28,
            alignItems: "center",
            position: "relative",
            transform: "rotate(-0.5deg)",
            overflow: "hidden",
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
              opacity: 0.6,
            }}
          />

          {/* Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              border: "2.5px solid var(--ink)",
              borderRadius: 16,
              background: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 36,
              boxShadow: "var(--shadow-sm)",
              flexShrink: 0,
              position: "relative",
              zIndex: 1,
            }}
          >
            {course.emoji ?? "📚"}
          </div>

          {/* Info */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <span
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.04em",
                background: "var(--ink)",
                color: "#fff",
                padding: "4px 9px",
                borderRadius: 6,
                display: "inline-block",
                marginBottom: 8,
                transform: "rotate(-2deg)",
                boxShadow: "2px 2px 0 rgba(0,0,0,0.15)",
              }}
            >
              {course.code}
            </span>
            <h1
              style={{
                fontFamily: "var(--font-bricolage), serif",
                fontWeight: 700,
                fontSize: 38,
                letterSpacing: "-0.025em",
                lineHeight: 1,
                marginBottom: 6,
                color: "var(--ink)",
              }}
            >
              {course.name}
            </h1>
            {course.description && (
              <p
                style={{
                  fontSize: 14.5,
                  color: "var(--ink-soft)",
                  maxWidth: 480,
                }}
              >
                {course.description}
              </p>
            )}
          </div>

          {/* Stats chips */}
          <div
            style={{
              display: "flex",
              gap: 18,
              position: "relative",
              zIndex: 1,
            }}
          >
            <StatChip value="65%" label="Done" />
            <StatChip value="7d" label="Streak" />
            <StatChip value="42m" label="Today" />
          </div>
        </div>

        {/* Edit/Delete buttons */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 20,
          }}
        >
          <button
            className="neo-btn"
            onClick={() => setEditOpen(true)}
            style={{ padding: "9px 15px", fontSize: 13 }}
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 15px",
              background: "#ffb37c",
              border: "2px solid var(--ink)",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              color: "var(--ink)",
              boxShadow: "var(--shadow-sm)",
              transition: "all 0.12s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translate(-2px, -2px)";
              e.currentTarget.style.boxShadow = "5px 5px 0 var(--ink)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </section>

      <CourseDialog open={editOpen} onOpenChange={setEditOpen} course={course} />
      <DeleteCourseConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        course={course}
        onDeleted={() => router.push("/")}
      />
    </>
  );
}

function StatChip({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "2.5px solid var(--ink)",
        borderRadius: 12,
        padding: "10px 14px",
        textAlign: "center",
        boxShadow: "var(--shadow-sm)",
        minWidth: 76,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-bricolage), serif",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ink-soft)",
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}
