"use client";

import { useState } from "react";
import { useCoursesWithStats } from "@/hooks";
import { CourseCard } from "@/components/app/CourseCard";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ServiceError } from "@/types";
import { useUIStore } from "@/store/uiStore";
import { dataSource } from "@/services";

type Filter = "all" | "in-progress" | "up-next";

export default function Dashboard() {
  const openAddCourse = useUIStore((s) => s.openAddCourse);
  const { data, isLoading, error, refetch, isFetching } = useCoursesWithStats();
  const [filter, setFilter] = useState<Filter>("all");

  const totalFlashcards = data?.reduce((s, c) => s + c.flashcardCount, 0) ?? 0;
  const totalSummaries = data?.reduce((s, c) => s + c.summaryCount, 0) ?? 0;
  const courseCount = data?.length ?? 0;

  const filteredCourses =
    data?.filter((c) => {
      if (filter === "in-progress") return c.flashcardCount > 0;
      if (filter === "up-next") return c.flashcardCount === 0;
      return true;
    }) ?? [];

  return (
    <>
      {/* Floating decorations */}
      <svg
        aria-hidden
        style={{
          position: "absolute",
          top: 140,
          left: 30,
          opacity: 0.5,
          pointerEvents: "none",
          zIndex: 0,
        }}
        width="50"
        height="50"
        viewBox="0 0 50 50"
      >
        <path
          d="M25 5 L29 21 L45 25 L29 29 L25 45 L21 29 L5 25 L21 21 Z"
          fill="#fcc419"
          stroke="#1a1612"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        aria-hidden
        style={{
          position: "absolute",
          top: 240,
          right: 60,
          pointerEvents: "none",
          zIndex: 0,
        }}
        width="44"
        height="44"
        viewBox="0 0 44 44"
      >
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="#ff6b9d"
          stroke="#1a1612"
          strokeWidth="2.5"
        />
        <circle cx="16" cy="20" r="2.5" fill="#1a1612" />
        <circle cx="28" cy="20" r="2.5" fill="#1a1612" />
        <path
          d="M14 27 Q 22 32 30 27"
          fill="none"
          stroke="#1a1612"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <svg
        aria-hidden
        style={{
          position: "absolute",
          top: 480,
          left: 70,
          pointerEvents: "none",
          zIndex: 0,
        }}
        width="60"
        height="20"
        viewBox="0 0 60 20"
      >
        <path
          d="M2 10 Q 12 -2 22 10 T 42 10 T 58 10"
          fill="none"
          stroke="#0891b2"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      {/* HERO */}
      <section
        style={{
          position: "relative",
          padding: "64px 40px 32px",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 28,
              height: 2.5,
              background: "var(--ink)",
            }}
          />
          Welcome back, Master coder!
        </div>

        <h1
          style={{
            fontFamily: "var(--font-bricolage), serif",
            fontWeight: 700,
            fontSize: "clamp(48px, 7vw, 84px)",
            lineHeight: 0.95,
            letterSpacing: "-0.035em",
            maxWidth: 900,
          }}
        >
          Your brain,
          <br />
          on{" "}
          <span
            style={{
              position: "relative",
              display: "inline-block",
              color: "var(--algo-deep)",
              fontStyle: "italic",
              fontWeight: 600,
            }}
            className="squiggle-underline"
          >
            {/*  computer&nbsp;science */}
            steroids
          </span>{" "}
          🧠
        </h1>

        <p
          style={{
            marginTop: 22,
            fontSize: 18,
            color: "var(--ink-soft)",
            maxWidth: 560,
          }}
        >
          Pick up where you left off — flashcards, summaries, and a code sandbox
          per course. No syllabus stress, just steady momentum.
        </p>

        {/* STATS STRIP */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            marginTop: 44,
            marginBottom: 24,
          }}
        >
          <StatCard
            icon="🔥"
            label="Streak"
            value="7"
            unit=" days"
            delay="0.05s"
            iconBg="var(--net)"
          />
          <StatCard
            icon="🃏"
            label="Flashcards"
            value={String(totalFlashcards)}
            unit=""
            delay="0.10s"
            iconBg="var(--algo)"
          />
          <StatCard
            icon="📄"
            label="Summaries"
            value={String(totalSummaries)}
            unit=""
            delay="0.15s"
            iconBg="var(--os)"
          />
          <StatCard
            icon="📚"
            label="Courses"
            value={String(courseCount)}
            unit=""
            delay="0.20s"
            iconBg="var(--db)"
          />
        </div>
      </section>

      {/* COURSES */}
      <section
        style={{
          maxWidth: 1280,
          margin: "24px auto 80px",
          padding: "0 40px",
          position: "relative",
        }}
      >
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 32,
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
            Your courses
            <span
              className="animate-spin-star"
              style={{ color: "var(--ds-yellow)" }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
                  stroke="#1a1612"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </h2>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "in-progress", "up-next"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "7px 14px",
                  background: filter === f ? "var(--ink)" : "var(--paper)",
                  color: filter === f ? "var(--paper)" : "var(--ink)",
                  border: "2px solid var(--ink)",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {f === "all"
                  ? "All"
                  : f === "in-progress"
                    ? "In progress"
                    : "Up next"}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 28,
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[310px] w-full rounded-[18px]" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">
                Couldn&apos;t load courses
              </CardTitle>
              <CardDescription>
                {error instanceof ServiceError
                  ? `${error.code}: ${error.message}`
                  : "Unexpected error."}
                {dataSource() === "api" && (
                  <span className="mt-2 block text-xs">
                    You&apos;re running with{" "}
                    <code>NEXT_PUBLIC_DATA_SOURCE=api</code>. Set it back to{" "}
                    <code>mock</code> or wire up the real backend.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? "Retrying…" : "Retry"}
              </Button>
            </div>
          </Card>
        )}

        {/* Course grid */}
        {!isLoading && !error && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 28,
            }}
            className="course-grid"
          >
            {filteredCourses.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}

            {/* Add new course card */}
            <article
              className="neo-card animate-float-up"
              onClick={openAddCourse}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openAddCourse()}
              style={
                {
                  "--card-rotate": "-0.5deg",
                  background: "var(--paper)",
                  borderStyle: "dashed",
                  borderWidth: 3,
                  padding: 26,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  color: "var(--ink-soft)",
                  minHeight: 310,
                  animationDelay: `${0.05 + filteredCourses.length * 0.08}s`,
                } as React.CSSProperties
              }
            >
              <div
                style={{
                  fontFamily: "var(--font-bricolage), serif",
                  fontSize: 64,
                  fontWeight: 300,
                  lineHeight: 1,
                  color: "var(--ink-soft)",
                  marginBottom: 4,
                }}
              >
                +
              </div>
              <div
                style={{
                  fontFamily: "var(--font-bricolage), serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                Add a course
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  maxWidth: 220,
                  marginTop: 8,
                  color: "var(--ink-soft)",
                }}
              >
                Drop a syllabus or pick from the catalog — we&apos;ll generate
                cards.
              </p>
            </article>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 40px 60px",
          textAlign: "center",
          color: "var(--ink-soft)",
          fontSize: 13,
        }}
      >
        Made with <span style={{ color: "var(--ds-pink)" }}>♥</span> for
        late-night studiers and morning-commute reviewers.
      </footer>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  delay,
  iconBg,
}: {
  icon: string;
  label: string;
  value: string;
  unit: string;
  delay: string;
  iconBg: string;
}) {
  return (
    <div
      className="animate-float-up"
      style={{
        background: "var(--paper)",
        border: "2.5px solid var(--ink)",
        borderRadius: 14,
        padding: "18px 20px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        animationDelay: delay,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          border: "2.5px solid var(--ink)",
          display: "grid",
          placeItems: "center",
          fontSize: 22,
          flexShrink: 0,
          backgroundColor: iconBg,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "var(--font-bricolage), serif",
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginTop: 2,
          }}
        >
          {value}
          {unit && (
            <small
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--ink-faint)",
                marginLeft: 2,
              }}
            >
              {unit}
            </small>
          )}
        </div>
      </div>
    </div>
  );
}
