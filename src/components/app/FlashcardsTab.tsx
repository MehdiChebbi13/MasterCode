"use client";

import { useMemo, useState } from "react";
import { Plus, Play, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlashcards } from "@/hooks";
import { ServiceError, type Flashcard } from "@/types";
import { FlashcardItem } from "./FlashcardItem";
import { FlashcardDialog } from "./FlashcardDialog";
import { DeleteFlashcardConfirm } from "./DeleteFlashcardConfirm";
import { StudyMode } from "./StudyMode";

interface FlashcardsTabProps {
  courseId: string;
  courseName: string;
}

export function FlashcardsTab({ courseId, courseName }: FlashcardsTabProps) {
  const { data, isLoading, error } = useFlashcards(courseId);

  const [filter, setFilter] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Flashcard | null>(null);
  const [deleting, setDeleting] = useState<Flashcard | null>(null);
  const [studyOpen, setStudyOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!data) return [] as Flashcard[];
    const q = filter.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (c) =>
        c.front.toLowerCase().includes(q) ||
        c.back.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [data, filter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground" />
          <h2 className="text-base font-medium">
            Flashcards{data ? ` (${data.length})` : ""}
          </h2>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 w-full sm:w-56"
            disabled={!data || data.length === 0}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setStudyOpen(true)}
            disabled={!data || data.length === 0}
          >
            <Play className="size-3.5" />
            Study
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      )}

      {error && !isLoading && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Couldn&apos;t load flashcards</CardTitle>
            <CardDescription>
              {error instanceof ServiceError ? `${error.code}: ${error.message}` : "Unexpected error."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {data && data.length === 0 && (
        <EmptyFlashcards onAdd={() => setAddOpen(true)} />
      )}

      {data && data.length > 0 && filtered.length === 0 && (
        <p className="rounded-md border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
          No cards match &quot;{filter}&quot;.
        </p>
      )}

      {filtered.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((card) => (
            <FlashcardItem
              key={card.id}
              flashcard={card}
              onEdit={(c) => setEditing(c)}
              onDelete={(c) => setDeleting(c)}
            />
          ))}
        </div>
      )}

      <FlashcardDialog open={addOpen} onOpenChange={setAddOpen} courseId={courseId} />
      <FlashcardDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        courseId={courseId}
        flashcard={editing ?? undefined}
      />
      <DeleteFlashcardConfirm
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        flashcard={deleting}
      />
      <StudyMode
        open={studyOpen}
        onOpenChange={setStudyOpen}
        cards={data ?? []}
        courseId={courseId}
        courseName={courseName}
      />
    </div>
  );
}

function EmptyFlashcards({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-14 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Layers className="size-6" />
      </div>
      <h3 className="text-base font-medium">No flashcards yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Add a few cards to start building this course&apos;s deck. Study mode unlocks once you have at least one.
      </p>
      <Button onClick={onAdd} className="mt-4 gap-1.5" size="sm">
        <Plus className="size-3.5" />
        Add a flashcard
      </Button>
    </div>
  );
}
