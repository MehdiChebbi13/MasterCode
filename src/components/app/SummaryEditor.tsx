"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSummary, useUpdateSummary } from "@/hooks";
import { ServiceError, type Summary, type SummaryInput } from "@/types";
import { MarkdownView } from "./MarkdownView";

interface SummaryEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  /** When provided, edit mode. */
  summary?: Summary;
  onSaved?: (summary: Summary) => void;
}

const PLACEHOLDER = `# Chapter title

Open with a one-paragraph plain-English summary so future-you can refresh the topic in 30 seconds.

## Key idea

A subhead per concept. Then 2–3 sentences each.

## Worked example

\`\`\`python
def example():
    return "you can drop in code blocks"
\`\`\`

## Things to check yourself on
1. ...
2. ...
`;

export function SummaryEditor({ open, onOpenChange, courseId, summary, onSaved }: SummaryEditorProps) {
  const isEdit = Boolean(summary);
  const createMutation = useCreateSummary();
  const updateMutation = useUpdateSummary();
  const pending = createMutation.isPending || updateMutation.isPending;

  const [chapter, setChapter] = useState<string>("1");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (open) {
      setChapter(String(summary?.chapter ?? 1));
      setTitle(summary?.title ?? "");
      setContent(summary?.contentMarkdown ?? "");
      setMobileView("edit");
    }
  }, [open, summary]);

  // Body scroll lock + Esc to close.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, pending, onOpenChange]);

  if (!open) return null;

  async function handleSave() {
    const t = title.trim();
    const ch = Number(chapter);
    if (!Number.isFinite(ch) || ch < 0) {
      toast.error("Chapter must be a number");
      return;
    }
    if (!t) {
      toast.error("Title is required");
      return;
    }
    try {
      if (isEdit && summary) {
        const patch: Partial<SummaryInput> = { chapter: ch, title: t, contentMarkdown: content };
        const saved = await updateMutation.mutateAsync({ id: summary.id, patch });
        toast.success("Summary updated");
        onSaved?.(saved);
      } else {
        const input: SummaryInput = { courseId, chapter: ch, title: t, contentMarkdown: content };
        const saved = await createMutation.mutateAsync(input);
        toast.success("Summary added");
        onSaved?.(saved);
      }
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof ServiceError ? err.message : "Failed to save summary.";
      toast.error(message);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={isEdit ? "Edit summary" : "Add summary"} className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex flex-col gap-3 border-b border-border/60 px-4 py-3 sm:px-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Close" onClick={() => onOpenChange(false)} disabled={pending}>
            <X className="size-4" />
          </Button>
          <h2 className="text-base font-medium">{isEdit ? "Edit summary" : "Add summary"}</h2>
        </div>

        <div className="grid flex-1 grid-cols-[5rem_1fr] items-center gap-2 lg:ml-4 lg:max-w-2xl">
          <div className="grid gap-1">
            <Label htmlFor="sum-chapter" className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Chapter
            </Label>
            <Input
              id="sum-chapter"
              type="number"
              min={0}
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="sum-title" className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Title
            </Label>
            <Input
              id="sum-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Divide and Conquer"
              className="h-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <div className="inline-flex rounded-md border border-border/60 p-0.5 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileView("edit")}
              className={`rounded px-2 py-1 text-xs ${mobileView === "edit" ? "bg-muted" : "text-muted-foreground"}`}
            >
              <Pencil className="mr-1 inline size-3" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setMobileView("preview")}
              className={`rounded px-2 py-1 text-xs ${mobileView === "preview" ? "bg-muted" : "text-muted-foreground"}`}
            >
              <Eye className="mr-1 inline size-3" />
              Preview
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Add summary"}
          </Button>
        </div>
      </header>

      <div className="grid flex-1 overflow-hidden lg:grid-cols-2">
        <section
          aria-label="Markdown source"
          className={`flex flex-col overflow-hidden border-border/60 lg:border-r ${
            mobileView === "edit" ? "flex" : "hidden"
          } lg:flex`}
        >
          <div className="border-b border-border/40 bg-muted/30 px-4 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            Source
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Tab" && !e.shiftKey) {
                e.preventDefault();
                const t = e.currentTarget;
                const { selectionStart, selectionEnd, value } = t;
                const next = value.slice(0, selectionStart) + "  " + value.slice(selectionEnd);
                setContent(next);
                requestAnimationFrame(() => {
                  t.selectionStart = t.selectionEnd = selectionStart + 2;
                });
              }
            }}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            className="flex-1 resize-none bg-background px-4 py-3 font-mono text-sm leading-6 outline-none placeholder:text-muted-foreground/50"
          />
        </section>

        <section
          aria-label="Live preview"
          className={`flex flex-col overflow-hidden ${mobileView === "preview" ? "flex" : "hidden"} lg:flex`}
        >
          <div className="border-b border-border/40 bg-muted/30 px-4 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            Preview
          </div>
          <div className="flex-1 overflow-auto px-6 py-6">
            {content.trim() ? (
              <MarkdownView source={content} className="mx-auto max-w-2xl" />
            ) : (
              <p className="text-sm text-muted-foreground">Start typing on the left — preview will render here.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
