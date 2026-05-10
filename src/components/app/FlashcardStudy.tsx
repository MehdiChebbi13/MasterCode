"use client";

import { useEffect, useState, useRef } from "react";
import type { Flashcard } from "@/types";

interface FlashcardStudyProps {
  flashcards: Flashcard[];
  onAddFlashcard?: () => void;
}

const STICKERS = [
  { txt: "🔥 ON A ROLL", bg: "var(--ds-yellow)", rot: "8deg" },
  { txt: "⚡ BIG IDEA", bg: "var(--ds-pink)", rot: "-6deg" },
  { txt: "🧠 KEY CONCEPT", bg: "var(--ds-mint)", rot: "7deg" },
  { txt: "✦ CLASSIC", bg: "var(--peach)", rot: "-7deg" },
  { txt: "☆ FUNDAMENTAL", bg: "var(--sky)", rot: "6deg" },
  { txt: "💡 LEVEL UP", bg: "var(--ds-yellow)", rot: "-8deg" },
];

export function FlashcardStudy({ flashcards, onAddFlashcard }: FlashcardStudyProps) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [enterDir, setEnterDir] = useState<"left" | "right" | null>(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const flashcardRef = useRef<HTMLDivElement>(null);

  const card = flashcards[idx];
  const sticker = STICKERS[idx % STICKERS.length];

  const goTo = (newIdx: number, direction: number) => {
    if (newIdx < 0 || newIdx >= flashcards.length || newIdx === idx) return;

    setExitDir(direction > 0 ? "left" : "right");
    setTimeout(() => {
      setIdx(newIdx);
      setFlipped(false);
      setExitDir(null);
      setEnterDir(direction > 0 ? "left" : "right");
      setTimeout(() => setEnterDir(null), 420);
    }, 280);
  };

  const flip = () => setFlipped(!flipped);

  const markKnown = (isKnown: boolean) => {
    const newKnown = new Set(known);
    if (isKnown) {
      newKnown.add(card.id);
    } else {
      newKnown.delete(card.id);
    }
    setKnown(newKnown);

    if (idx < flashcards.length - 1) {
      goTo(idx + 1, 1);
    }
  };

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === " ") {
        e.preventDefault();
        flip();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(idx - 1, -1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(idx + 1, 1);
      } else if (e.key === "Tab") {
        e.preventDefault();
        // Tab to switch views would be handled by parent
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [idx, flipped]);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    if (dt > 600) return;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goTo(idx + 1, 1);
      else goTo(idx - 1, -1);
    }
  };

  if (!card) return null;

  return (
    <section
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "24px 40px 80px",
        position: "relative",
      }}
    >
      {/* Meta row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-bricolage), serif",
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "-0.02em",
            display: "inline-flex",
            alignItems: "baseline",
            gap: 6,
          }}
        >
          <span>{idx + 1}</span>
          <span style={{ color: "var(--ink-faint)", fontSize: 18 }}>/{flashcards.length}</span>
          <span
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--ink-soft)",
              marginLeft: 12,
            }}
          >
            Card on deck
          </span>
        </div>

        {/* Progress dots + add button */}
        <div style={{ display: "inline-flex", gap: 14, alignItems: "center" }}>
          <div
            style={{
              display: "inline-flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            {flashcards.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > idx ? 1 : -1)}
                aria-label={`Go to card ${i + 1}`}
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid var(--ink)",
                  background: known.has(flashcards[i].id) ? "var(--ds-mint)" : "var(--paper)",
                  borderRadius: "50%",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  ...(i === idx && {
                    background: "var(--algo-deep)",
                    transform: "scale(1.3)",
                    boxShadow: "1.5px 1.5px 0 var(--ink)",
                  }),
                }}
              />
            ))}
          </div>
          {onAddFlashcard && (
            <button
              onClick={onAddFlashcard}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 14px",
                background: "var(--algo)", color: "var(--ink)",
                border: "2.5px solid var(--ink)", borderRadius: 10,
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                boxShadow: "3px 3px 0 var(--ink)",
                transition: "transform 0.12s ease, box-shadow 0.12s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translate(-2px,-2px)";
                e.currentTarget.style.boxShadow = "5px 5px 0 var(--ink)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "3px 3px 0 var(--ink)";
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add card
            </button>
          )}
        </div>
      </div>

      {/* Card navigation */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: 24,
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <button
          onClick={() => goTo(idx - 1, -1)}
          disabled={idx === 0}
          style={{
            width: 56,
            height: 56,
            background: "var(--paper)",
            border: "2.5px solid var(--ink)",
            borderRadius: 14,
            cursor: idx === 0 ? "not-allowed" : "pointer",
            boxShadow: idx === 0 ? "var(--shadow-sm)" : undefined,
            display: "grid",
            placeItems: "center",
            transition: "transform 0.12s ease, box-shadow 0.12s ease, background 0.2s ease",
            opacity: idx === 0 ? 0.35 : 1,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (idx > 0) {
              e.currentTarget.style.transform = "translate(-2px, -2px)";
              e.currentTarget.style.boxShadow = "5px 5px 0 var(--ink)";
              e.currentTarget.style.background = "var(--ds-yellow)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = idx === 0 ? "var(--shadow-sm)" : "var(--shadow-sm)";
            e.currentTarget.style.background = "var(--paper)";
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Flashcard */}
        <div
          ref={flashcardRef}
          style={{
            perspective: "2000px",
            width: "100%",
            maxWidth: 720,
            margin: "0 auto",
            aspectRatio: "1.55 / 1",
            position: "relative",
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              cursor: "pointer",
              transformStyle: "preserve-3d",
              transition: "transform 0.6s cubic-bezier(.5, .05, .25, 1.05)",
              transform: flipped ? `rotate(${1.4}deg) rotateY(180deg)` : `rotate(-1.4deg)`,
              ...(exitDir === "left" && {
                animation: "flashcard-exit-left 0.32s ease forwards",
              }),
              ...(exitDir === "right" && {
                animation: "flashcard-exit-right 0.32s ease forwards",
              }),
              ...(enterDir === "left" && {
                animation: "flashcard-enter-left 0.4s cubic-bezier(.2,.9,.3,1.2) both",
              }),
              ...(enterDir === "right" && {
                animation: "flashcard-enter-right 0.4s cubic-bezier(.2,.9,.3,1.2) both",
              }),
            }}
            onClick={flip}
          >
            {/* Front */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "2.5px solid var(--ink)",
                borderRadius: 22,
                boxShadow: "var(--shadow-xl)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                padding: "44px 56px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                background: "var(--algo)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(26, 22, 18, 0.07) 1px, transparent 0)",
                  backgroundSize: "16px 16px",
                  pointerEvents: "none",
                  opacity: 0.55,
                }}
              />
              <div
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--ink-soft)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 24,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--algo-deep)",
                    border: "1.5px solid var(--ink)",
                  }}
                />
                Question
              </div>
              <div
                style={{
                  fontFamily: "var(--font-bricolage), serif",
                  fontWeight: 600,
                  fontSize: "clamp(28px, 4vw, 44px)",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.1,
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                  zIndex: 1,
                  color: "var(--ink)",
                }}
              >
                {card.front}
              </div>
              <div
                style={{
                  marginTop: 16,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-soft)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    border: "2px solid var(--ink)",
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: "var(--paper)",
                    fontSize: 12,
                  }}
                >
                  ↻
                </span>
                Click anywhere to flip
              </div>
            </div>

            {/* Back */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "2.5px solid var(--ink)",
                borderRadius: 22,
                boxShadow: "var(--shadow-xl)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                padding: "44px 56px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                background: "var(--paper)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(26, 22, 18, 0.07) 1px, transparent 0)",
                  backgroundSize: "16px 16px",
                  pointerEvents: "none",
                  opacity: 0.55,
                }}
              />
              <div
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--ink-soft)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 24,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--ds-mint)",
                    border: "1.5px solid var(--ink)",
                  }}
                />
                Answer
              </div>
              <div
                style={{
                  fontSize: "clamp(16px, 1.7vw, 19px)",
                  lineHeight: 1.55,
                  color: "var(--ink)",
                  flex: 1,
                  overflowY: "auto",
                  position: "relative",
                  zIndex: 1,
                }}
                dangerouslySetInnerHTML={{ __html: card.back }}
              />
              <div
                style={{
                  marginTop: 16,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-soft)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    border: "2px solid var(--ink)",
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: "var(--algo-light)",
                    fontSize: 12,
                  }}
                >
                  ↻
                </span>
                Click to flip back
              </div>
            </div>

            {/* Sticker */}
            <div
              style={{
                position: "absolute",
                top: -14,
                right: 28,
                background: sticker.bg,
                color: "var(--ink)",
                border: "2.5px solid var(--ink)",
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                transform: `rotate(${sticker.rot})`,
                boxShadow: "2px 2px 0 var(--ink)",
                zIndex: 3,
                pointerEvents: "none",
              }}
            >
              {sticker.txt}
            </div>
          </div>
        </div>

        <button
          onClick={() => goTo(idx + 1, 1)}
          disabled={idx === flashcards.length - 1}
          style={{
            width: 56,
            height: 56,
            background: "var(--paper)",
            border: "2.5px solid var(--ink)",
            borderRadius: 14,
            cursor: idx === flashcards.length - 1 ? "not-allowed" : "pointer",
            boxShadow: idx === flashcards.length - 1 ? "var(--shadow-sm)" : undefined,
            display: "grid",
            placeItems: "center",
            transition: "transform 0.12s ease, box-shadow 0.12s ease, background 0.2s ease",
            opacity: idx === flashcards.length - 1 ? 0.35 : 1,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (idx < flashcards.length - 1) {
              e.currentTarget.style.transform = "translate(-2px, -2px)";
              e.currentTarget.style.boxShadow = "5px 5px 0 var(--ink)";
              e.currentTarget.style.background = "var(--ds-yellow)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = idx === flashcards.length - 1 ? "var(--shadow-sm)" : "var(--shadow-sm)";
            e.currentTarget.style.background = "var(--paper)";
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 14,
          marginTop: 8,
        }}
      >
        <button
          onClick={() => markKnown(false)}
          style={{
            background: "var(--peach)",
            border: "2.5px solid var(--ink)",
            borderRadius: 12,
            padding: "12px 22px",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
            transition: "transform 0.12s ease, box-shadow 0.12s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "var(--ink)",
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
          <span>😬</span> Need to review
        </button>
        <button
          onClick={() => markKnown(true)}
          style={{
            background: "var(--ds-mint)",
            border: "2.5px solid var(--ink)",
            borderRadius: 12,
            padding: "12px 22px",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
            transition: "transform 0.12s ease, box-shadow 0.12s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "var(--ink)",
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
          <span>✨</span> Got it!
        </button>
      </div>

      <style>{`
        @keyframes flashcard-exit-left {
          to {
            transform: rotate(-8deg) translateX(-180%);
            opacity: 0;
          }
        }
        @keyframes flashcard-exit-right {
          to {
            transform: rotate(8deg) translateX(180%);
            opacity: 0;
          }
        }
        @keyframes flashcard-enter-left {
          from {
            transform: rotate(8deg) translateX(60%);
            opacity: 0;
          }
          to {
            transform: rotate(-1.4deg) translateX(0);
            opacity: 1;
          }
        }
        @keyframes flashcard-enter-right {
          from {
            transform: rotate(-8deg) translateX(-60%);
            opacity: 0;
          }
          to {
            transform: rotate(-1.4deg) translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}
