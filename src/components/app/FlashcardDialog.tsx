"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateFlashcard, useUpdateFlashcard } from "@/hooks";
import { ServiceError, type Flashcard, type FlashcardInput } from "@/types";

interface FlashcardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  /** When provided, edit mode. */
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

  useEffect(() => {
    if (open) {
      setFront(flashcard?.front ?? "");
      setBack(flashcard?.back ?? "");
      setTagsRaw(flashcard?.tags.join(", ") ?? "");
    }
  }, [open, flashcard]);

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
        toast.success("Flashcard added");
      }
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof ServiceError ? err.message : "Something went wrong. Try again.";
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit flashcard" : "Add flashcard"}</DialogTitle>
          <DialogDescription>
            Front is the prompt, back is the answer. Tags are optional and comma-separated.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fc-front">Front</Label>
            <Textarea
              id="fc-front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="What is the worst-case time complexity of quicksort?"
              rows={2}
              autoFocus
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fc-back">Back</Label>
            <Textarea
              id="fc-back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="O(n²) — when partitions are extremely unbalanced…"
              rows={5}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fc-tags">Tags (optional)</Label>
            <Input
              id="fc-tags"
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="sorting, complexity"
            />
            <p className="text-xs text-muted-foreground">Comma-separated.</p>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add flashcard"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
