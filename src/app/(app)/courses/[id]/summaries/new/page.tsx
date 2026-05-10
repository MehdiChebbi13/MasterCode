"use client";

import { useCourse } from "@/hooks";
import { SummaryBlockEditor } from "@/components/app/SummaryBlockEditor";

export default function NewSummaryPage({ params }: { params: { id: string } }) {
  const { data: course } = useCourse(params.id);
  return <SummaryBlockEditor courseId={params.id} courseName={course?.name} />;
}
