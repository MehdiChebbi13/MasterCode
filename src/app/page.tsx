"use client";

import { useCoursesWithStats } from "@/hooks";
import { CourseCard } from "@/components/app/CourseCard";
import { EmptyState } from "@/components/app/EmptyState";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ServiceError } from "@/types";
import { useUIStore } from "@/store/uiStore";
import { dataSource } from "@/services";

export default function Dashboard() {
  const openAddCourse = useUIStore((s) => s.openAddCourse);
  const { data, isLoading, error, refetch, isFetching } = useCoursesWithStats();

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick up where you left off — flashcards, summaries, and a code sandbox per course.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      )}

      {error && !isLoading && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Couldn&apos;t load courses</CardTitle>
            <CardDescription>
              {error instanceof ServiceError ? `${error.code}: ${error.message}` : "Unexpected error."}
              {dataSource() === "api" && (
                <span className="mt-2 block text-xs">
                  You&apos;re running with <code>NEXT_PUBLIC_DATA_SOURCE=api</code>, which routes to the stub
                  <code> ApiCoursesService</code>. Set it back to <code>mock</code> or wire up the real backend.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? "Retrying…" : "Retry"}
            </Button>
          </div>
        </Card>
      )}

      {data && data.length === 0 && <EmptyState onAdd={openAddCourse} />}

      {data && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </main>
  );
}
