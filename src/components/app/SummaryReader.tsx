"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Summary } from "@/types";
import { formatRelativeTime } from "@/lib/format";
import { MarkdownView } from "./MarkdownView";
import { SummaryEditor } from "./SummaryEditor";
import { DeleteSummaryConfirm } from "./DeleteSummaryConfirm";
import { ExplainPopover } from "./ExplainPopover";

interface SummaryReaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: Summary | null;
}

export function SummaryReader({ open, onOpenChange, summary }: SummaryReaderProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const articleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !editOpen && !deleteOpen) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, editOpen, deleteOpen, onOpenChange]);

  if (!open || !summary) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={`Reading: ${summary.title}`} className="fixed inset-0 z-40 flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border/60 px-4 py-3 sm:px-6">
        <Button variant="ghost" size="icon" aria-label="Close" onClick={() => onOpenChange(false)}>
          <X className="size-4" />
        </Button>
        <Badge variant="outline" className="font-mono">
          Ch {summary.chapter}
        </Badge>
        <h2 className="min-w-0 truncate text-base font-medium sm:text-lg">{summary.title}</h2>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
            <Pencil className="size-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </header>

      <main
        className="flex-1 overflow-auto px-4 py-8 sm:px-8"
        data-explainable="summary"
        data-summary-id={summary.id}
      >
        <article ref={articleRef} className="mx-auto max-w-2xl">
          <MarkdownView source={summary.contentMarkdown} />
          <p className="mt-12 border-t border-border/40 pt-4 text-xs text-muted-foreground">
            Last updated {formatRelativeTime(summary.updatedAt)}
            {summary.createdAt !== summary.updatedAt && ` · created ${formatRelativeTime(summary.createdAt)}`}
          </p>
        </article>
      </main>

      <ExplainPopover scopeRef={articleRef} mode="summary" context={summary.contentMarkdown} />

      <SummaryEditor
        open={editOpen}
        onOpenChange={setEditOpen}
        courseId={summary.courseId}
        summary={summary}
      />
      <DeleteSummaryConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        summary={summary}
        onDeleted={() => onOpenChange(false)}
      />
    </div>
  );
}
