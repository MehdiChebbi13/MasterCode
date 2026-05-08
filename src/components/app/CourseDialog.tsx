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
import { useCreateCourse, useUpdateCourse } from "@/hooks";
import { ServiceError, type Course, type CourseInput } from "@/types";

const PRESET_COLORS = [
  "#7c3aed",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#6366f1",
  "#84cc16",
];

const PRESET_EMOJI = ["📚", "⚙️", "🖥️", "🗃️", "🌐", "🧠", "🧪", "🛠️", "🔐", "📐"];

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog operates in edit mode. */
  course?: Course;
  onSaved?: (course: Course) => void;
}

export function CourseDialog({ open, onOpenChange, course, onSaved }: CourseDialogProps) {
  const isEdit = Boolean(course);
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const pending = createMutation.isPending || updateMutation.isPending;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [emoji, setEmoji] = useState<string | undefined>(PRESET_EMOJI[0]);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setName(course?.name ?? "");
      setCode(course?.code ?? "");
      setColor(course?.color ?? PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setEmoji(course?.emoji ?? PRESET_EMOJI[0]);
      setDescription(course?.description ?? "");
    }
  }, [open, course]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    if (!trimmedName || !trimmedCode) {
      toast.error("Name and course code are required");
      return;
    }
    const input: CourseInput = {
      name: trimmedName,
      code: trimmedCode,
      color,
      emoji,
      description: description.trim() || undefined,
    };
    try {
      const saved = isEdit
        ? await updateMutation.mutateAsync({ id: course!.id, patch: input })
        : await createMutation.mutateAsync(input);
      toast.success(isEdit ? `Updated ${saved.name}` : `Added ${saved.name}`);
      onSaved?.(saved);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof ServiceError ? err.message : "Something went wrong. Try again.";
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit course" : "Add a course"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the metadata for this course."
              : "Pick a name, code, and a color/emoji to find it quickly on the dashboard."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="course-name">Name</Label>
            <Input
              id="course-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Algorithms"
              autoFocus
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="course-code">Code</Label>
            <Input
              id="course-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="CS 161"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Pick ${c}`}
                    aria-pressed={color === c}
                    className={`size-7 rounded-full ring-offset-2 ring-offset-background transition ${
                      color === c ? "ring-2 ring-foreground" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Emoji</Label>
              <div className="flex flex-wrap gap-1">
                {PRESET_EMOJI.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    aria-pressed={emoji === e}
                    className={`size-8 rounded-md text-lg transition ${
                      emoji === e ? "bg-muted ring-1 ring-foreground" : "hover:bg-muted/60"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="course-description">Description (optional)</Label>
            <Textarea
              id="course-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this course about?"
              rows={3}
            />
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
