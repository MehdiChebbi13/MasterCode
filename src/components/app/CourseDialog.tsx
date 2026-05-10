"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateCourse, useUpdateCourse } from "@/hooks";
import { ServiceError, type Course, type CourseInput } from "@/types";

const PRESET_COLORS = [
  "#cbb6ff", "#9be8f5", "#66d9a6", "#fcc419",
  "#ff6b9d", "#ffb37c", "#ff8c5a", "#5fb8e8",
];

const PRESET_EMOJI = ["📚", "⚙️", "🖥️", "🗃️", "🌐", "🧠", "🧪", "🛠️", "🔐", "📐"];

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course;
  onSaved?: (course: Course) => void;
}

export function CourseDialog({ open, onOpenChange, course, onSaved }: CourseDialogProps) {
  const isEdit = Boolean(course);
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const pending = createMutation.isPending || updateMutation.isPending;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [emoji, setEmoji] = useState<string>(PRESET_EMOJI[0]);
  const [description, setDescription] = useState("");

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(course?.name ?? "");
      setCode(course?.code ?? "");
      setColor(course?.color ?? PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setEmoji(course?.emoji ?? PRESET_EMOJI[0]);
      setDescription(course?.description ?? "");
      setTimeout(() => firstInputRef.current?.focus(), 60);
    }
  }, [open, course]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    if (!trimmedName || !trimmedCode) {
      toast.error("Name and course code are required");
      return;
    }
    const input: CourseInput = {
      name: trimmedName,
      code: trimmedCode.toUpperCase(),
      color,
      emoji,
      description: description.trim() || undefined,
    };
    try {
      const saved = isEdit
        ? await updateMutation.mutateAsync({ id: course!.id, patch: input })
        : await createMutation.mutateAsync(input);
      toast.success(isEdit ? `Updated ${saved.name}` : `"${saved.name}" added to your library!`);
      onSaved?.(saved);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ServiceError ? err.message : "Something went wrong. Try again.");
    }
  }

  if (!open) return null;

  return (
    <>
      <style>{`
        .cd-input {
          width: 100%; padding: 11px 14px;
          border: 2.5px solid var(--ink); border-radius: 11px;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
          font-size: 15px; font-weight: 500;
          background: var(--paper); color: var(--ink);
          outline: none; transition: box-shadow 0.15s ease;
          box-shadow: 2px 2px 0 transparent;
        }
        .cd-input:focus { box-shadow: 3px 3px 0 var(--ink); }
        .cd-input::placeholder { color: var(--ink-faint); }
        .cd-textarea {
          width: 100%; padding: 11px 14px;
          border: 2.5px solid var(--ink); border-radius: 11px;
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
          font-size: 15px; font-weight: 500; resize: vertical; min-height: 80px;
          background: var(--paper); color: var(--ink);
          outline: none; transition: box-shadow 0.15s ease;
          box-shadow: 2px 2px 0 transparent;
        }
        .cd-textarea:focus { box-shadow: 3px 3px 0 var(--ink); }
        .cd-textarea::placeholder { color: var(--ink-faint); }
        .cd-label {
          font-family: var(--font-jetbrains, 'JetBrains Mono'), monospace;
          font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--ink-soft); display: block; margin-bottom: 9px;
        }
        .cd-color-swatch {
          width: 34px; height: 34px; border-radius: 9px;
          border: 2.5px solid var(--ink); cursor: pointer;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
          position: relative; flex-shrink: 0;
        }
        .cd-color-swatch:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--ink); }
        .cd-color-swatch.selected { transform: translate(-2px,-2px); box-shadow: 4px 4px 0 var(--ink); }
        .cd-emoji-btn {
          width: 42px; height: 42px; border-radius: 10px;
          border: 2px solid var(--ink); cursor: pointer; font-size: 20px;
          display: grid; place-items: center;
          background: var(--paper);
          transition: transform 0.12s ease, background 0.12s ease, box-shadow 0.12s ease;
          box-shadow: 2px 2px 0 var(--ink);
        }
        .cd-emoji-btn:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--ink); }
        .cd-emoji-btn.selected { background: var(--ds-yellow); transform: translate(-2px,-2px); box-shadow: 4px 4px 0 var(--ink); }
        .cd-cancel-btn {
          padding: 10px 20px;
          border: 2.5px solid var(--ink); border-radius: 10px;
          background: var(--paper); color: var(--ink-soft);
          font-family: var(--font-dm-sans,'DM Sans'), sans-serif;
          font-weight: 600; font-size: 14px; cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .cd-cancel-btn:hover { transform: translate(-2px,-2px); box-shadow: 5px 5px 0 var(--ink); }
        .cd-cancel-btn:active { transform: translate(1px,1px); box-shadow: 1px 1px 0 var(--ink); }
        .cd-submit-btn {
          padding: 11px 28px;
          border: 2.5px solid var(--ink); border-radius: 10px;
          background: var(--ink); color: var(--paper);
          font-family: var(--font-dm-sans,'DM Sans'), sans-serif;
          font-weight: 700; font-size: 15px; cursor: pointer;
          box-shadow: var(--shadow);
          transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.2s ease;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .cd-submit-btn:hover:not(:disabled) { transform: translate(-2px,-2px); box-shadow: 8px 8px 0 var(--ink); background: var(--algo-deep); }
        .cd-submit-btn:active:not(:disabled) { transform: translate(1px,1px); box-shadow: 1px 1px 0 var(--ink); }
        .cd-submit-btn:disabled { opacity: 0.6; cursor: wait; }
        .cd-close-btn {
          width: 36px; height: 36px; border-radius: 9px;
          border: 2px solid var(--ink); background: var(--paper);
          display: grid; place-items: center; cursor: pointer;
          box-shadow: 2px 2px 0 var(--ink); font-size: 16px; color: var(--ink-soft);
          transition: transform 0.12s ease;
        }
        .cd-close-btn:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--ink); }
      `}</style>

      {/* Overlay */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit course" : "Add a course"}
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
            width: "100%", maxWidth: 520,
            maxHeight: "90vh", overflowY: "auto",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticker */}
          <span style={{
            position: "absolute", top: -13, left: 28,
            background: isEdit ? "var(--ds-pink)" : "var(--ds-mint)",
            color: "var(--ink)", border: "2.5px solid var(--ink)",
            borderRadius: 999, fontSize: 10.5, fontWeight: 800,
            padding: "4px 12px", letterSpacing: "0.1em", textTransform: "uppercase",
            transform: "rotate(-5deg)", boxShadow: "2px 2px 0 var(--ink)",
            zIndex: 2, pointerEvents: "none",
          }}>
            {isEdit ? "✏️ EDIT" : "✦ NEW"}
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
              {/* Live preview badge */}
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: color, border: "2.5px solid var(--ink)",
                boxShadow: "var(--shadow-sm)",
                display: "grid", placeItems: "center",
                fontSize: 30, flexShrink: 0,
                transform: "rotate(-6deg)",
                transition: "background 0.2s ease",
              }}>
                {emoji}
              </div>
              <div>
                <h2 style={{
                  fontFamily: "var(--font-bricolage,'Bricolage Grotesque'),serif",
                  fontWeight: 700, fontSize: 26,
                  letterSpacing: "-0.03em", lineHeight: 1.1,
                  color: "var(--ink)",
                }}>
                  {isEdit ? "Edit course" : "Add a course"}
                </h2>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 5, fontWeight: 500 }}>
                  {isEdit ? "Update the details below." : "Pick a name, code, color & emoji."}
                </p>
              </div>
            </div>
            <button className="cd-close-btn" type="button" onClick={() => onOpenChange(false)} aria-label="Close">
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: "28px 28px 32px" }}>

            {/* Name */}
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="cd-name" className="cd-label">Course name</label>
              <input
                ref={firstInputRef}
                id="cd-name"
                className="cd-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Algorithms & Data Structures"
                required
              />
            </div>

            {/* Code */}
            <div style={{ marginBottom: 24 }}>
              <label htmlFor="cd-code" className="cd-label">Course code</label>
              <input
                id="cd-code"
                className="cd-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CS 161"
                required
                style={{ textTransform: "uppercase" } as React.CSSProperties}
              />
            </div>

            {/* Color + Emoji row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              {/* Color */}
              <div>
                <span className="cd-label">Card color</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`cd-color-swatch${color === c ? " selected" : ""}`}
                      style={{ background: c }}
                      onClick={() => setColor(c)}
                      aria-label={`Pick color ${c}`}
                      aria-pressed={color === c}
                    >
                      {color === c && (
                        <span style={{
                          position: "absolute", inset: 0,
                          display: "grid", placeItems: "center",
                          color: "var(--ink)", fontSize: 14, fontWeight: 900,
                        }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emoji */}
              <div>
                <span className="cd-label">Emoji</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {PRESET_EMOJI.map((e) => (
                    <button
                      key={e}
                      type="button"
                      className={`cd-emoji-btn${emoji === e ? " selected" : ""}`}
                      onClick={() => setEmoji(e)}
                      aria-pressed={emoji === e}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 32 }}>
              <label htmlFor="cd-desc" className="cd-label">
                Description <span style={{ color: "var(--ink-faint)", fontSize: 10, fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
              </label>
              <textarea
                id="cd-desc"
                className="cd-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this course about?"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, alignItems: "center" }}>
              <button
                type="button"
                className="cd-cancel-btn"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cd-submit-btn"
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
                  <>
                    <span>+</span> Add course
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
