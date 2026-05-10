"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateFlashcard, useUpdateFlashcard } from "@/hooks";
import { ServiceError, type Flashcard, type FlashcardInput } from "@/types";

interface FlashcardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  flashcard?: Flashcard;
}

const parseTags = (raw: string): string[] =>
  raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

export function FlashcardDialog({ open, onOpenChange, courseId, flashcard }: FlashcardDialogProps) {
  const isEdit = Boolean(flashcard);
  const createMutation = useCreateFlashcard();
  const updateMutation = useUpdateFlashcard();
  const pending = createMutation.isPending || updateMutation.isPending;

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");

  const firstInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setFront(flashcard?.front ?? "");
      setBack(flashcard?.back ?? "");
      setTagsRaw(flashcard?.tags.join(", ") ?? "");
      setTimeout(() => firstInputRef.current?.focus(), 60);
    }
  }, [open, flashcard]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const f = front.trim();
    const b = back.trim();
    if (!f || !b) {
      toast.error("Front and back are required");
      return;
    }
    const tags = parseTags(tagsRaw);
    try {
      if (isEdit && flashcard) {
        const patch: Partial<FlashcardInput> = { front: f, back: b, tags };
        await updateMutation.mutateAsync({ id: flashcard.id, patch });
        toast.success("Flashcard updated");
      } else {
        const input: FlashcardInput = { courseId, front: f, back: b, tags };
        await createMutation.mutateAsync(input);
        toast.success("Flashcard added!");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ServiceError ? err.message : "Something went wrong. Try again.");
    }
  }

  const tagPills = parseTags(tagsRaw);

  if (!open) return null;

  return (
    <>
      <style>{`
        .fd-input {
          width: 100%; padding: 11px 14px;
          border: 2.5px solid var(--ink); border-radius: 11px;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
          font-size: 15px; font-weight: 500;
          background: var(--paper); color: var(--ink);
          outline: none; transition: box-shadow 0.15s ease;
          box-shadow: 2px 2px 0 transparent;
        }
        .fd-input:focus { box-shadow: 3px 3px 0 var(--ink); }
        .fd-input::placeholder { color: var(--ink-faint); }
        .fd-textarea {
          width: 100%; padding: 11px 14px;
          border: 2.5px solid var(--ink); border-radius: 11px;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
          font-size: 15px; font-weight: 500; resize: vertical;
          background: var(--paper); color: var(--ink);
          outline: none; transition: box-shadow 0.15s ease;
          box-shadow: 2px 2px 0 transparent;
        }
        .fd-textarea:focus { box-shadow: 3px 3px 0 var(--ink); }
        .fd-textarea::placeholder { color: var(--ink-faint); }
        .fd-front-textarea {
          background: var(--algo);
        }
        .fd-label {
          font-family: var(--font-jetbrains, 'JetBrains Mono'), monospace;
          font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--ink-soft); display: block; margin-bottom: 9px;
        }
        .fd-cancel-btn {
          padding: 10px 20px;
          border: 2.5px solid var(--ink); border-radius: 10px;
          background: var(--paper); color: var(--ink-soft);
          font-family: var(--font-dm-sans,'DM Sans'), sans-serif;
          font-weight: 600; font-size: 14px; cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .fd-cancel-btn:hover { transform: translate(-2px,-2px); box-shadow: 5px 5px 0 var(--ink); }
        .fd-cancel-btn:active { transform: translate(1px,1px); box-shadow: 1px 1px 0 var(--ink); }
        .fd-submit-btn {
          padding: 11px 28px;
          border: 2.5px solid var(--ink); border-radius: 10px;
          background: var(--ink); color: var(--paper);
          font-family: var(--font-dm-sans,'DM Sans'), sans-serif;
          font-weight: 700; font-size: 15px; cursor: pointer;
          box-shadow: var(--shadow);
          transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.2s ease;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .fd-submit-btn:hover:not(:disabled) { transform: translate(-2px,-2px); box-shadow: 8px 8px 0 var(--ink); background: var(--algo-deep); }
        .fd-submit-btn:active:not(:disabled) { transform: translate(1px,1px); box-shadow: 1px 1px 0 var(--ink); }
        .fd-submit-btn:disabled { opacity: 0.6; cursor: wait; }
        .fd-close-btn {
          width: 36px; height: 36px; border-radius: 9px;
          border: 2px solid var(--ink); background: var(--paper);
          display: grid; place-items: center; cursor: pointer;
          box-shadow: 2px 2px 0 var(--ink); font-size: 16px; color: var(--ink-soft);
          transition: transform 0.12s ease;
        }
        .fd-close-btn:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--ink); }
        .fd-tag-pill {
          font-family: var(--font-jetbrains, 'JetBrains Mono'), monospace;
          font-size: 10.5px; font-weight: 600;
          background: var(--ds-yellow); color: var(--ink);
          border: 2px solid var(--ink);
          padding: 3px 9px; border-radius: 999px;
          display: inline-block;
        }
      `}</style>

      {/* Overlay */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit flashcard" : "Add a flashcard"}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(26,22,18,0.55)",
          backdropFilter: "blur(3px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
      >
        {/* Card */}
        <div
          style={{
            background: "var(--paper)",
            border: "2.5px solid var(--ink)",
            borderRadius: 22,
            boxShadow: "var(--shadow-lg)",
            width: "100%", maxWidth: 540,
            maxHeight: "92vh", overflowY: "auto",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticker */}
          <span style={{
            position: "absolute", top: -13, left: 28,
            background: isEdit ? "var(--ds-pink)" : "var(--algo)",
            color: "var(--ink)", border: "2.5px solid var(--ink)",
            borderRadius: 999, fontSize: 10.5, fontWeight: 800,
            padding: "4px 12px", letterSpacing: "0.1em", textTransform: "uppercase",
            transform: "rotate(-5deg)", boxShadow: "2px 2px 0 var(--ink)",
            zIndex: 2, pointerEvents: "none",
          }}>
            {isEdit ? "✏️ EDIT" : "✦ NEW CARD"}
          </span>

          {/* Header */}
          <div style={{
            padding: "32px 28px 24px",
            background: "var(--cream-deep)",
            borderBottom: "2.5px solid var(--ink)",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 18,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {/* Mini card preview */}
              <div style={{
                width: 64, height: 64, borderRadius: 14,
                background: "var(--algo)",
                border: "2.5px solid var(--ink)",
                boxShadow: "var(--shadow-sm)",
                display: "grid", placeItems: "center",
                fontSize: 26, flexShrink: 0,
                transform: "rotate(-6deg)",
                fontFamily: "var(--font-bricolage), serif",
                fontWeight: 700, color: "var(--ink)",
              }}>
                Q
              </div>
              <div>
                <h2 style={{
                  fontFamily: "var(--font-bricolage,'Bricolage Grotesque'),serif",
                  fontWeight: 700, fontSize: 26,
                  letterSpacing: "-0.03em", lineHeight: 1.1,
                  color: "var(--ink)",
                }}>
                  {isEdit ? "Edit flashcard" : "New flashcard"}
                </h2>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 5, fontWeight: 500 }}>
                  {isEdit ? "Update the front, back, or tags." : "Front is the prompt, back is the answer."}
                </p>
              </div>
            </div>
            <button className="fd-close-btn" type="button" onClick={() => onOpenChange(false)} aria-label="Close">
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: "28px 28px 32px" }}>

            {/* Front */}
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="fd-front" className="fd-label">
                <span style={{ color: "var(--algo-deep)", marginRight: 6 }}>●</span>
                Front — the question
              </label>
              <textarea
                ref={firstInputRef}
                id="fd-front"
                className="fd-textarea fd-front-textarea"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="What is the worst-case time complexity of quicksort?"
                rows={3}
                required
              />
            </div>

            {/* Back */}
            <div style={{ marginBottom: 24 }}>
              <label htmlFor="fd-back" className="fd-label">
                <span style={{ color: "var(--ds-mint)", marginRight: 6 }}>●</span>
                Back — the answer
              </label>
              <textarea
                id="fd-back"
                className="fd-textarea"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="O(n²) — when partitions are extremely unbalanced (e.g. already sorted input with naive pivot)."
                rows={5}
                required
              />
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 32 }}>
              <label htmlFor="fd-tags" className="fd-label">
                Tags{" "}
                <span style={{ color: "var(--ink-faint)", fontSize: 10, fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>
                  (optional, comma-separated)
                </span>
              </label>
              <input
                id="fd-tags"
                className="fd-input"
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                placeholder="sorting, complexity, algorithms"
              />
              {tagPills.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {tagPills.map((tag) => (
                    <span key={tag} className="fd-tag-pill">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, alignItems: "center" }}>
              <button
                type="button"
                className="fd-cancel-btn"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="fd-submit-btn"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
                    Saving…
                  </>
                ) : isEdit ? (
                  <>✓ Save changes</>
                ) : (
                  <><span>+</span> Add flashcard</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
