"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type TabValue = "flashcards" | "summaries";

const TABS: { value: TabValue; label: string; icon: string; count?: number }[] = [
  { value: "flashcards", label: "🃏 Flashcards", icon: "🃏" },
  { value: "summaries", label: "📖 Summaries", icon: "📖" },
];

function isTabValue(v: string | null): v is TabValue {
  return v === "flashcards" || v === "summaries";
}

export function CourseViewSwitcher({
  onTabChange,
  flashcardCount,
  summaryCount,
}: {
  onTabChange: (tab: TabValue) => void;
  flashcardCount: number;
  summaryCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const raw = params?.get("tab") ?? null;
  const value: TabValue = isTabValue(raw) ? raw : "flashcards";
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  const setTab = useCallback(
    (next: TabValue) => {
      const sp = new URLSearchParams(params?.toString() ?? "");
      sp.set("tab", next);
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
      onTabChange(next);
    },
    [router, pathname, params, onTabChange],
  );

  const updateIndicator = useCallback(() => {
    const active = document.querySelector(".seg-btn.active");
    if (active && active.parentElement) {
      const rect = active.getBoundingClientRect();
      const parent = active.parentElement.getBoundingClientRect();
      setIndicatorStyle({
        left: `${rect.left - parent.left}px`,
        width: `${rect.width}px`,
      });
    }
  }, []);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  useEffect(() => {
    updateIndicator();
  }, [value, updateIndicator]);

  const counts = {
    flashcards: flashcardCount,
    summaries: summaryCount,
  };

  return (
    <section
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "32px 40px 8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "inline-flex",
          background: "var(--paper)",
          border: "2.5px solid var(--ink)",
          borderRadius: 14,
          padding: 5,
          boxShadow: "var(--shadow)",
        }}
      >
        {/* Animated indicator */}
        <div
          style={{
            position: "absolute",
            top: 5,
            bottom: 5,
            background: "var(--ink)",
            borderRadius: 9,
            transition: "left 0.32s cubic-bezier(.5, 1.6, .4, 1), width 0.32s cubic-bezier(.5, 1.6, .4, 1)",
            zIndex: 0,
            ...indicatorStyle,
          }}
        />

        {/* Buttons */}
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className="seg-btn"
            onClick={() => setTab(tab.value)}
            style={{
              position: "relative",
              zIndex: 1,
              background: "transparent",
              border: "none",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: value === tab.value ? "var(--paper)" : "var(--ink)",
              padding: "9px 18px",
              borderRadius: 9,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "color 0.32s ease",
              whiteSpace: "nowrap",
            }}
            data-active={value === tab.value}
          >
            {tab.label}
            <span
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 11,
                fontWeight: 700,
                background: value === tab.value ? "rgba(255, 250, 239, 0.18)" : "rgba(26, 22, 18, 0.12)",
                color: value === tab.value ? "var(--paper)" : "var(--ink)",
                padding: "2px 7px",
                borderRadius: 999,
                transition: "all 0.32s ease",
              }}
            >
              {counts[tab.value as TabValue]}
            </span>
          </button>
        ))}
      </div>

      {/* Keyboard hint */}
      <div
        style={{
          fontSize: 12.5,
          color: "var(--ink-faint)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <kbd style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, fontWeight: 600, background: "var(--paper)", border: "1.5px solid var(--ink)", borderRadius: 5, padding: "2px 6px", boxShadow: "1.5px 1.5px 0 var(--ink)", color: "var(--ink)" }}>Space</kbd>
        flip
        <kbd style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, fontWeight: 600, background: "var(--paper)", border: "1.5px solid var(--ink)", borderRadius: 5, padding: "2px 6px", boxShadow: "1.5px 1.5px 0 var(--ink)", color: "var(--ink)" }}>
          ←→
        </kbd>
        navigate
        <kbd style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, fontWeight: 600, background: "var(--paper)", border: "1.5px solid var(--ink)", borderRadius: 5, padding: "2px 6px", boxShadow: "1.5px 1.5px 0 var(--ink)", color: "var(--ink)" }}>
          Tab
        </kbd>
        switch
      </div>
    </section>
  );
}
