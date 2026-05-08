"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseDialog } from "./CourseDialog";
import { DeleteCourseConfirm } from "./DeleteCourseConfirm";
import { formatRelativeTime } from "@/lib/format";
import type { Course } from "@/types";

export function CourseHeader({ course }: { course: Course }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <header className="overflow-hidden rounded-xl border border-border/60 bg-card/50">
      <div className="h-1.5 w-full" style={{ backgroundColor: course.color }} />
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
              {course.code}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Last studied {formatRelativeTime(course.lastStudiedAt).toLowerCase()}
            </span>
          </div>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {course.emoji && <span aria-hidden>{course.emoji}</span>}
            <span className="break-words">{course.name}</span>
          </h1>
          {course.description && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{course.description}</p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <CourseDialog open={editOpen} onOpenChange={setEditOpen} course={course} />
      <DeleteCourseConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        course={course}
        onDeleted={() => router.replace("/")}
      />
    </header>
  );
}
