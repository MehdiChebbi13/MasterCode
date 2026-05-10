"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCourse, useFlashcards, useSummaries } from "@/hooks";
import { CourseHeader } from "@/components/app/CourseHeader";
import { CourseViewSwitcher } from "@/components/app/CourseViewSwitcher";
import { FlashcardStudy } from "@/components/app/FlashcardStudy";
import { FlashcardDialog } from "@/components/app/FlashcardDialog";
import { SummariesGrid } from "@/components/app/SummariesGrid";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ServiceError } from "@/types";

export default function CoursePage({ params }: { params: { id: string } }) {
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useCourse(params.id);
  const { data: flashcards, isLoading: flashcardsLoading } = useFlashcards(
    params.id,
  );
  const { data: summaries, isLoading: summariesLoading } = useSummaries(
    params.id,
  );

  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"flashcards" | "summaries">(
    (searchParams.get("tab") as "flashcards" | "summaries") ?? "flashcards",
  );
  const initialReadId = searchParams.get("read") ?? undefined;
  const [flashcardDialogOpen, setFlashcardDialogOpen] = useState(false);

  if (courseLoading) {
    return (
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 40px" }}>
        <Skeleton className="h-32 w-full rounded-xl mb-6" />
        <Skeleton className="h-9 w-72 rounded-md" />
      </main>
    );
  }

  if (courseError || !course) {
    return (
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 40px" }}>
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">
              {courseError instanceof ServiceError &&
              courseError.code === "not_found"
                ? "Course not found"
                : "Couldn't load this course"}
            </CardTitle>
            <CardDescription>
              {courseError instanceof ServiceError
                ? courseError.message
                : "Unexpected error."}
            </CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <>
      <FlashcardDialog
        open={flashcardDialogOpen}
        onOpenChange={setFlashcardDialogOpen}
        courseId={params.id}
      />
      <CourseHeader course={course} />
      <CourseViewSwitcher
        onTabChange={setActiveTab}
        flashcardCount={flashcards?.length ?? 0}
        summaryCount={summaries?.length ?? 0}
      />

      {/* FLASHCARDS VIEW */}
      {activeTab === "flashcards" && (
        <>
          {flashcardsLoading ? (
            <div
              style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 40px" }}
            >
              <Skeleton className="h-80 w-full rounded-xl" />
            </div>
          ) : flashcards && flashcards.length > 0 ? (
            <FlashcardStudy
              flashcards={flashcards}
              onAddFlashcard={() => setFlashcardDialogOpen(true)}
            />
          ) : (
            <div
              style={{
                maxWidth: 1280,
                margin: "0 auto",
                padding: "60px 40px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  color: "var(--ink-soft)",
                  marginBottom: 20,
                }}
              >
                No flashcards yet. Create one to get started!
              </div>
              <Button size="sm" className="gap-1.5" onClick={() => setFlashcardDialogOpen(true)}>
                + Add flashcard
              </Button>
            </div>
          )}
        </>
      )}

      {/* SUMMARIES VIEW */}
      {activeTab === "summaries" && (
        <>
          {summariesLoading ? (
            <div
              style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 40px" }}
            >
              <Skeleton className="h-64 w-full rounded-xl mb-6" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : summaries ? (
            <SummariesGrid
              summaries={summaries}
              courseId={params.id}
              courseName={course?.name}
              initialReadId={initialReadId}
              onOpenFlashcards={() => setActiveTab("flashcards")}
            />
          ) : null}
        </>
      )}
    </>
  );
}
