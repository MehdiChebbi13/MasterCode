"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFlashcardsService } from "@/services";
import type { FlashcardInput, ReviewHistoryEntry } from "@/types";
import { queryKeys } from "./queryKeys";

export function useFlashcards(courseId: string | undefined) {
  return useQuery({
    queryKey: courseId ? queryKeys.flashcards.byCourse(courseId) : queryKeys.flashcards.byCourse("__missing__"),
    queryFn: () => getFlashcardsService().listByCourse(courseId as string),
    enabled: Boolean(courseId),
  });
}

export function useCreateFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FlashcardInput) => getFlashcardsService().create(input),
    onSuccess: (card) => {
      qc.invalidateQueries({ queryKey: queryKeys.flashcards.byCourse(card.courseId) });
      qc.invalidateQueries({ queryKey: queryKeys.courses.listWithStats() });
    },
  });
}

export function useUpdateFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<FlashcardInput> }) =>
      getFlashcardsService().update(id, patch),
    onSuccess: (card) => {
      qc.invalidateQueries({ queryKey: queryKeys.flashcards.byCourse(card.courseId) });
    },
  });
}

export function useDeleteFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, courseId: _courseId }: { id: string; courseId: string }) =>
      getFlashcardsService().delete(id),
    onSuccess: (_void, { courseId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.flashcards.byCourse(courseId) });
      qc.invalidateQueries({ queryKey: queryKeys.courses.listWithStats() });
    },
  });
}

export function useRecordReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, difficulty }: { id: string; difficulty: ReviewHistoryEntry["difficulty"] }) =>
      getFlashcardsService().recordReview(id, difficulty),
    onSuccess: (card) => {
      qc.invalidateQueries({ queryKey: queryKeys.flashcards.byCourse(card.courseId) });
    },
  });
}
