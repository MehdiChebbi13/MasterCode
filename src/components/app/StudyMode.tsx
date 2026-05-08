"use client";

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Shuffle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMarkCourseStudied, useRecordReview } from "@/hooks";
import type { Flashcard, ReviewHistoryEntry } from "@/types";

interface StudyModeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cards: Flashcard[];
  courseId: string;
  courseName: string;
}

const DIFFICULTIES: { value: ReviewHistoryEntry["difficulty"]; label: string; hint: string; tone: string }[] = [
  { value: 1, label: "Again", hint: "1", tone: "bg-red-500/10 text-red-300 hover:bg-red-500/20 border-red-500/30" },
  { value: 2, label: "Hard", hint: "2", tone: "bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 border-orange-500/30" },
  { value: 3, label: "Good", hint: "3", tone: "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/30" },
  { value: 4, label: "Easy", hint: "4", tone: "bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 border-sky-500/30" },
];

function shuffleArray<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function StudyMode({ open, onOpenChange, cards, courseId, courseName }: StudyModeProps) {
  const [deck, setDeck] = useState<Flashcard[]>(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);
  const recordReview = useRecordReview();
  const markStudied = useMarkCourseStudied();
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Reset state whenever the session opens.
  useEffect(() => {
    if (open) {
      setDeck(cards);
      setIndex(0);
      setFlipped(false);
      setReviewedIds(new Set());
      setDone(cards.length === 0);
      if (cards.length > 0) markStudied.mutate(courseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cards, courseId]);

  const current = deck[index];

  const advance = useCallback(() => {
    setFlipped(false);
    setIndex((i) => {
      if (i + 1 >= deck.length) {
        setDone(true);
        return i;
      }
      return i + 1;
    });
  }, [deck.length]);

  const back = useCallback(() => {
    setFlipped(false);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleRate = useCallback(
    (difficulty: ReviewHistoryEntry["difficulty"]) => {
      if (!current || done) return;
      recordReview.mutate(
        { id: current.id, difficulty },
        {
          onSuccess: () => {
            setReviewedIds((prev) => {
              const next = new Set(prev);
              next.add(current.id);
              return next;
            });
          },
        },
      );
      advance();
    },
    [current, done, recordReview, advance],
  );

  const handleShuffle = useCallback(() => {
    setDeck((d) => shuffleArray(d));
    setIndex(0);
    setFlipped(false);
    setDone(false);
    setReviewedIds(new Set());
  }, []);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Keyboard shortcuts.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === " ") {
        e.preventDefault();
        if (done) return;
        setFlipped((f) => !f);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (done) return;
        advance();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (done) return;
        back();
        return;
      }
      if (["1", "2", "3", "4"].includes(e.key) && !done) {
        e.preventDefault();
        handleRate(Number(e.key) as ReviewHistoryEntry["difficulty"]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, done, advance, back, handleRate, onOpenChange]);

  // Focus trap entry point.
  useEffect(() => {
    if (open) cardRef.current?.focus();
  }, [open]);

  const progress = useMemo(() => {
    if (deck.length === 0) return 0;
    return Math.round(((reviewedIds.size) / deck.length) * 100);
  }, [reviewedIds.size, deck.length]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={`Study ${courseName} flashcards`} className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border/60 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="font-medium">{courseName}</span>
          <Badge variant="outline" className="font-mono">
            {done ? `${reviewedIds.size}/${deck.length} reviewed` : `${index + 1} / ${deck.length}`}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleShuffle}>
            <Shuffle className="size-3.5" />
            Shuffle
          </Button>
          <Button variant="ghost" size="icon" aria-label="Exit study mode" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
          </Button>
        </div>
      </header>

      <div className="h-1 w-full bg-muted">
        <div className="h-full bg-foreground/70 transition-[width]" style={{ width: `${progress}%` }} />
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
        {done ? (
          <SessionComplete
            total={deck.length}
            reviewed={reviewedIds.size}
            onRestart={handleShuffle}
            onClose={() => onOpenChange(false)}
          />
        ) : current ? (
          <>
            <FlipCard
              ref={cardRef}
              flipped={flipped}
              front={current.front}
              back={current.back}
              tags={current.tags}
              onFlip={() => setFlipped((f) => !f)}
            />
            <p className="mt-6 max-w-xl text-center text-xs text-muted-foreground">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">Space</kbd> flip ·{" "}
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">←</kbd>{" "}
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">→</kbd> nav ·{" "}
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">1</kbd>–
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">4</kbd> rate ·{" "}
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">Esc</kbd> exit
            </p>
          </>
        ) : null}
      </main>

      {!done && current && (
        <footer className="border-t border-border/60 bg-background/95 px-6 py-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={back} disabled={index === 0}>
              <ChevronLeft className="size-4" />
              Prev
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => handleRate(d.value)}
                  className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition ${d.tone}`}
                >
                  <span>{d.label}</span>
                  <kbd className="rounded bg-background/40 px-1 py-0.5 text-[10px] font-mono text-current opacity-80">
                    {d.hint}
                  </kbd>
                </button>
              ))}
            </div>

            <Button variant="ghost" size="sm" className="gap-1.5" onClick={advance}>
              Skip
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}

interface FlipCardProps {
  flipped: boolean;
  front: string;
  back: string;
  tags: string[];
  onFlip: () => void;
}

const FlipCard = forwardRef<HTMLDivElement, FlipCardProps>(function FlipCard(
  { flipped, front, back, tags, onFlip },
  ref,
) {
  return (
    <div
      ref={ref}
      tabIndex={0}
      role="button"
      aria-pressed={flipped}
      aria-label={
        flipped
          ? "Showing back. Press space to flip back to front."
          : "Showing front. Press space to reveal answer."
      }
      onClick={onFlip}
      className="relative h-[26rem] w-full max-w-2xl cursor-pointer outline-none [perspective:1400px]"
    >
      <div
        className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <Face className="bg-card">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Front</span>
          <p className="mt-4 text-balance text-center text-2xl font-medium leading-snug">{front}</p>
          {tags.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-1.5">
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px] uppercase tracking-wide">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </Face>
        <Face className="bg-card [transform:rotateY(180deg)]">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Back</span>
          <p className="mt-4 max-w-prose whitespace-pre-wrap text-center text-base leading-relaxed text-foreground/95">
            {back}
          </p>
        </Face>
      </div>
    </div>
  );
});

function Face({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border/70 px-8 py-10 shadow-xl [backface-visibility:hidden] ${className}`}
    >
      {children}
    </div>
  );
}

function SessionComplete({
  total,
  reviewed,
  onRestart,
  onClose,
}: {
  total: number;
  reviewed: number;
  onRestart: () => void;
  onClose: () => void;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-400">
        ✓
      </div>
      <h2 className="text-2xl font-semibold">Session complete</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        You rated {reviewed} of {total} {total === 1 ? "card" : "cards"} this session.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button variant="outline" size="sm" onClick={onRestart} className="gap-1.5">
          <Shuffle className="size-3.5" />
          Shuffle and restart
        </Button>
        <Button size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
