"use client";

import Link from "next/link";
import { ChevronRight, Layers, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CourseWithStats } from "@/types";
import { formatRelativeTime, pluralize } from "@/lib/format";

export function CourseCard({ course }: { course: CourseWithStats }) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group block rounded-xl outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Open ${course.name}`}
    >
      <Card className="h-full overflow-hidden transition-colors group-hover:border-foreground/30">
        <div className="h-1.5 w-full" style={{ backgroundColor: course.color }} />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 truncate text-base">
                {course.emoji && <span aria-hidden>{course.emoji}</span>}
                <span className="truncate">{course.name}</span>
              </CardTitle>
              <CardDescription className="mt-0.5 font-mono text-xs uppercase tracking-wide">
                {course.code}
              </CardDescription>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          {course.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
          )}
          <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-xs">
            <Stat icon={<Layers className="size-3.5" />} label={pluralize(course.flashcardCount, "card")} />
            <Stat icon={<FileText className="size-3.5" />} label={pluralize(course.summaryCount, "summary", "summaries")} />
            <Stat icon={<Clock className="size-3.5" />} label={formatRelativeTime(course.lastStudiedAt)} title="Last studied" />
          </dl>
        </CardContent>
      </Card>
    </Link>
  );
}

function Stat({ icon, label, title }: { icon: React.ReactNode; label: string; title?: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground" title={title}>
      <span className="text-foreground/70">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}
