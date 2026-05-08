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
import { useDeleteSummary } from "@/hooks";
import { ServiceError, type Summary } from "@/types";

interface DeleteSummaryConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: Summary | null;
  onDeleted?: () => void;
}

export function DeleteSummaryConfirm({ open, onOpenChange, summary, onDeleted }: DeleteSummaryConfirmProps) {
  const mutation = useDeleteSummary();

  async function handleDelete() {
    if (!summary) return;
    try {
      await mutation.mutateAsync({ id: summary.id, courseId: summary.courseId });
      toast.success("Summary deleted");
      onOpenChange(false);
      onDeleted?.();
    } catch (err) {
      const message = err instanceof ServiceError ? err.message : "Failed to delete summary.";
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this summary?</DialogTitle>
          <DialogDescription>
            {summary ? `Chapter ${summary.chapter}: "${summary.title}". This can't be undone.` : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={mutation.isPending || !summary}>
            {mutation.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
