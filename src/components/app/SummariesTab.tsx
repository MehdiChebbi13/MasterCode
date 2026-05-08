"use client";

import { useMemo, useState } from "react";
import { FileText, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSummaries } from "@/hooks";
import { ServiceError, type Summary } from "@/types";
import { formatRelativeTime } from "@/lib/format";
import { SummaryEditor } from "./SummaryEditor";
import { SummaryReader } from "./SummaryReader";
import { DeleteSummaryConfirm } from "./DeleteSummaryConfirm";

interface SummariesTabProps {
  courseId: string;
}

export function SummariesTab({ courseId }: SummariesTabProps) {
  const { data, isLoading, error } = useSummaries(courseId);

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Summary | null>(null);
  const [reading, setReading] = useState<Summary | null>(null);
  const [deleting, setDeleting] = useState<Summary | null>(null);

  const ordered = useMemo(() => (data ? [...data].sort((a, b) => a.chapter - b.chapter) : []), [data]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <h2 className="text-base font-medium">Summaries{data ? ` (${data.length})` : ""}</h2>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
          <Plus className="size-3.5" />
          Add summary
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {error && !isLoading && (
        <Card className="border-destructive/50 p-4 text-sm text-destructive">
          {error instanceof ServiceError ? `${error.code}: ${error.message}` : "Couldn't load summaries."}
        </Card>
      )}

      {data && data.length === 0 && <EmptySummaries onAdd={() => setAddOpen(true)} />}

      {ordered.length > 0 && (
        <ul className="grid gap-3">
          {ordered.map((s) => (
            <SummaryListItem
              key={s.id}
              summary={s}
              onOpen={() => setReading(s)}
              onEdit={() => setEditing(s)}
              onDelete={() => setDeleting(s)}
            />
          ))}
        </ul>
      )}

      <SummaryEditor open={addOpen} onOpenChange={setAddOpen} courseId={courseId} />
      <SummaryEditor
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        courseId={courseId}
        summary={editing ?? undefined}
      />
      <SummaryReader open={Boolean(reading)} onOpenChange={(open) => !open && setReading(null)} summary={reading} />
      <DeleteSummaryConfirm
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        summary={deleting}
      />
    </div>
  );
}

interface SummaryListItemProps {
  summary: Summary;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SummaryListItem({ summary, onOpen, onEdit, onDelete }: SummaryListItemProps) {
  const snippet = stripMarkdown(summary.contentMarkdown).slice(0, 200);
  return (
    <Card className="group flex items-start gap-3 px-4 py-4 transition-colors hover:border-foreground/30">
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 items-start gap-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Badge variant="outline" className="mt-0.5 shrink-0 font-mono text-[10px]">
          Ch {summary.chapter}
        </Badge>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="truncate text-sm font-medium group-hover:text-foreground">{summary.title}</h3>
            <span className="shrink-0 text-[11px] text-muted-foreground">{formatRelativeTime(summary.updatedAt)}</span>
          </div>
          {snippet && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {snippet}
              {summary.contentMarkdown.length > 200 && "…"}
            </p>
          )}
        </div>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="size-7 shrink-0 text-muted-foreground" aria-label="Summary actions">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 size-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}

function EmptySummaries({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-14 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <FileText className="size-6" />
      </div>
      <h3 className="text-base font-medium">No summaries yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Capture chapter notes in markdown — code blocks render with syntax highlighting, and you&apos;ll be able to ask
        the AI to explain any selection.
      </p>
      <Button onClick={onAdd} className="mt-4 gap-1.5" size="sm">
        <Plus className="size-3.5" />
        Add a summary
      </Button>
    </div>
  );
}

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[*_>~|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
