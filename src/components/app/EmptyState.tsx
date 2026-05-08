"use client";

import { GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <GraduationCap className="size-6" />
      </div>
      <h2 className="text-lg font-medium">No courses yet</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Add your first course to start collecting flashcards, summaries, and a code sandbox in one place.
      </p>
      <Button onClick={onAdd} className="mt-5 gap-1.5">
        <Plus className="size-4" />
        Add a course
      </Button>
    </div>
  );
}
