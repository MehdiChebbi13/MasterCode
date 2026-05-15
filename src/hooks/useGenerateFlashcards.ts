"use client";

import { useMutation } from "@tanstack/react-query";

export type GeneratedFlashcard = { question: string; answer: string };

export interface GenerateFlashcardsInput {
  contentMarkdown: string;
  existingFlashcards: GeneratedFlashcard[];
}

export interface GenerateFlashcardsResult {
  insufficient: boolean;
  flashcards: GeneratedFlashcard[];
}

export function useGenerateFlashcards() {
  return useMutation<GenerateFlashcardsResult, Error, GenerateFlashcardsInput>({
    mutationFn: async ({ contentMarkdown, existingFlashcards }) => {
      const res = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentMarkdown, existingFlashcards }),
      });
      if (!res.ok) {
        const e: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(e.error || `Flashcards request failed: ${res.status}`);
      }
      return (await res.json()) as GenerateFlashcardsResult;
    },
  });
}
