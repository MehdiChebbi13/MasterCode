"use client";

import type { Summary } from "@/types";
import { SummaryReaderStyled } from "./SummaryReaderStyled";

interface SummaryReaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: Summary | null;
  courseName?: string;
  allSummaries?: Summary[];
  onNavigate?: (s: Summary) => void;
  onOpenFlashcards?: () => void;
}

export function SummaryReader({
  open,
  onOpenChange,
  summary,
  courseName,
  allSummaries,
  onNavigate,
  onOpenFlashcards,
}: SummaryReaderProps) {
  return (
    <SummaryReaderStyled
      open={open}
      onOpenChange={onOpenChange}
      summary={summary}
      courseName={courseName}
      allSummaries={allSummaries}
      onNavigate={onNavigate}
      onOpenFlashcards={onOpenFlashcards}
    />
  );
}
