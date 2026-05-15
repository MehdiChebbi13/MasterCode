"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useUIStore } from "@/store/uiStore";
import { dataSource } from "@/services";
import { ThemeToggle } from "./ThemeToggle";

export function TopNav() {
  const pathname = usePathname();
  const openAddCourse = useUIStore((s) => s.openAddCourse);
  const openGlobalSandbox = useUIStore((s) => s.openGlobalSandbox);
  const isDetail = pathname?.startsWith("/courses/");
  const isSandbox = pathname === "/sandbox";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 40px",
        borderBottom: "2.5px solid var(--ink)",
        background: "var(--paper)",
      }}
    >
      {/* Left: logo + badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {(isDetail || isSandbox) && (
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--ink-soft)",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              marginRight: 4,
            }}
          >
            <ArrowLeft size={15} />
            <span>Back</span>
          </Link>
        )}

        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            textDecoration: "none",
          }}
          className="group"
        >
          {/* Logo mark */}
          <div
            style={{
              width: 44,
              height: 44,
              background: "var(--ds-yellow)",
              border: "2.5px solid var(--ink)",
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              boxShadow: "var(--shadow-sm)",
              transform: "rotate(-4deg)",
              transition: "transform 0.2s ease",
              flexShrink: 0,
            }}
            className="group-hover:[transform:rotate(4deg)_scale(1.05)]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 5 L11 5 Q12 5 12 6 L12 21 Q12 20 11 20 L3 20 Z"
                stroke="#1a1612"
                strokeWidth="2.2"
                strokeLinejoin="round"
                fill="#fff"
              />
              <path
                d="M21 5 L13 5 Q12 5 12 6 L12 21 Q12 20 13 20 L21 20 Z"
                stroke="#1a1612"
                strokeWidth="2.2"
                strokeLinejoin="round"
                fill="#fff"
              />
            </svg>
          </div>
          {/* Logo text */}
          <span
            style={{
              fontFamily: "var(--font-bricolage), serif",
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
            }}
          >
            CS <span style={{ color: "var(--algo-deep)" }}>Kernel</span>
          </span>
        </Link>

        {/* Data source badge */}
        <span
          style={{
            background: "var(--ds-pink)",
            color: "var(--ink)",
            border: "2px solid var(--ink)",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 10px",
            letterSpacing: "0.08em",
            transform: "rotate(6deg)",
            boxShadow: "2px 2px 0 var(--ink)",
            display: "inline-block",
          }}
        >
          {dataSource().toUpperCase()}
        </span>
      </div>

      {/* Right: actions */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <ThemeToggle />
        <Link
          href="/sandbox"
          className="neo-btn"
          aria-label="Open sandbox"
          style={{
            textDecoration: "none",
            ...(isSandbox && {
              background: "var(--ds-mint)",
              color: "var(--ink)",
            }),
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span className="hidden sm:inline">Sandbox</span>
        </Link>
        <button className="neo-btn neo-btn-primary" onClick={openAddCourse}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add course</span>
        </button>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
