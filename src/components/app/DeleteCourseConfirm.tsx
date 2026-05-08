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
import { useDeleteCourse } from "@/hooks";
import { ServiceError, type Course } from "@/types";

interface DeleteCourseConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onDeleted?: () => void;
}

export function DeleteCourseConfirm({ open, onOpenChange, course, onDeleted }: DeleteCourseConfirmProps) {
  const mutation = useDeleteCourse();

  async function handleDelete() {
    if (!course) return;
    try {
      await mutation.mutateAsync(course.id);
      toast.success(`Deleted ${course.name}`);
      onOpenChange(false);
      onDeleted?.();
    } catch (err) {
      const message = err instanceof ServiceError ? err.message : "Failed to delete course.";
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this course?</DialogTitle>
          <DialogDescription>
            {course
              ? `"${course.name}" and all of its flashcards, summaries, and sandbox state will be removed. This can't be undone.`
              : "Loading…"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={mutation.isPending || !course}>
            {mutation.isPending ? "Deleting…" : "Delete course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
