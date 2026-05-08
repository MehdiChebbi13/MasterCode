"use client";

import Link from "next/link";
import { useCourse } from "@/hooks";
import { CourseHeader } from "@/components/app/CourseHeader";
import { CourseTabs } from "@/components/app/CourseTabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ServiceError } from "@/types";

export default function CoursePage({ params }: { params: { id: string } }) {
  const { data: course, isLoading, error } = useCourse(params.id);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-9 w-72 rounded-md" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      )}

      {error && !isLoading && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">
              {error instanceof ServiceError && error.code === "not_found" ? "Course not found" : "Couldn't load this course"}
            </CardTitle>
            <CardDescription>
              {error instanceof ServiceError ? error.message : "Unexpected error."}
            </CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <Button asChild variant="outline" size="sm">
              <Link href="/">Back to dashboard</Link>
            </Button>
          </div>
        </Card>
      )}

      {course && (
        <>
          <CourseHeader course={course} />
          <CourseTabs courseId={course.id} courseName={course.name} />
        </>
      )}
    </main>
  );
}
