"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Summary } from "@/types";
import { formatRelativeTime } from "@/lib/format";
import { SummaryReaderStyled } from "./SummaryReaderStyled";
import { SummaryEditor } from "./SummaryEditor";
import { DeleteSummaryConfirm } from "./DeleteSummaryConfirm";
import { ExplainPopover } from "./ExplainPopover";

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
