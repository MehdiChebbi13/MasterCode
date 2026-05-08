"use client";

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
import { useDeleteFlashcard } from "@/hooks";
import { ServiceError, type Flashcard } from "@/types";

interface DeleteFlashcardConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashcard: Flashcard | null;
  onDeleted?: () => void;
}

export function DeleteFlashcardConfirm({ open, onOpenChange, flashcard, onDeleted }: DeleteFlashcardConfirmProps) {
  const mutation = useDeleteFlashcard();

  async function handleDelete() {
    if (!flashcard) return;
    try {
      await mutation.mutateAsync({ id: flashcard.id, courseId: flashcard.courseId });
      toast.success("Flashcard deleted");
      onOpenChange(false);
      onDeleted?.();
    } catch (err) {
      const message = err instanceof ServiceError ? err.message : "Failed to delete flashcard.";
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this flashcard?</DialogTitle>
          <DialogDescription>
            {flashcard ? `"${flashcard.front.slice(0, 80)}${flashcard.front.length > 80 ? "…" : ""}"` : ""}
            <span className="mt-2 block">Its review history will be removed too. This can&apos;t be undone.</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={mutation.isPending || !flashcard}>
            {mutation.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
