"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Flashcard } from "@/types";
import { formatRelativeTime } from "@/lib/format";

interface FlashcardItemProps {
  flashcard: Flashcard;
  onEdit: (card: Flashcard) => void;
  onDelete: (card: Flashcard) => void;
}

export function FlashcardItem({ flashcard, onEdit, onDelete }: FlashcardItemProps) {
  const [revealed, setRevealed] = useState(false);
  const lastReview = flashcard.reviewHistory.at(-1);

  return (
    <Card className="flex flex-col gap-3 p-4 transition-colors hover:border-foreground/30">
      <div className="flex items-start justify-between gap-2">
        <p className="flex-1 text-sm font-medium leading-snug">{flashcard.front}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="size-7 text-muted-foreground" aria-label="Card actions">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => onEdit(flashcard)}>
              <Pencil className="mr-2 size-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(flashcard)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 size-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        {revealed ? (
          <p className="whitespace-pre-wrap text-sm text-foreground/90">{flashcard.back}</p>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="text-left text-sm text-muted-foreground underline-offset-2 hover:underline"
          >
            Show answer
          </button>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-3">
        {flashcard.tags.map((t) => (
          <Badge key={t} variant="secondary" className="text-[10px] uppercase tracking-wide">
            {t}
          </Badge>
        ))}
        <span className="ml-auto text-[11px] text-muted-foreground" title={lastReview?.reviewedAt}>
          {lastReview ? `Last review: ${formatRelativeTime(lastReview.reviewedAt)}` : "Not reviewed yet"}
        </span>
      </div>
    </Card>
  );
}
