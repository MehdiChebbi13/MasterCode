"use client";

import Link from "next/link";
import { useCourse, useSummary } from "@/hooks";
import { SummaryBlockEditor } from "@/components/app/SummaryBlockEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceError } from "@/types";

export default function EditSummaryPage({
  params,
}: {
  params: { id: string; summaryId: string };
}) {
  const { data: course } = useCourse(params.id);
  const { data: summary, isLoading, error } = useSummary(params.summaryId);

  if (isLoading) {
    return (
      <main style={{ maxWidth: 880, margin: "0 auto", padding: "60px 40px" }}>
        <Skeleton className="h-12 w-72 rounded-md mb-6" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </main>
    );
  }

  if (error || !summary) {
    return (
      <main style={{ maxWidth: 880, margin: "0 auto", padding: "60px 40px" }}>
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">
              {error instanceof ServiceError && error.code === "not_found"
                ? "Summary not found"
                : "Couldn't load this summary"}
            </CardTitle>
            <CardDescription>
              {error instanceof ServiceError ? error.message : "Unexpected error."}
            </CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <Button asChild variant="outline" size="sm">
              <Link href={`/courses/${params.id}`}>Back to course</Link>
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <SummaryBlockEditor
      courseId={params.id}
      summary={summary}
      courseName={course?.name}
    />
  );
}
