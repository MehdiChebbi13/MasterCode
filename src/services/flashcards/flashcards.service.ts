import type { Flashcard, FlashcardInput, ReviewHistoryEntry } from "@/types";

export interface FlashcardsService {
  listByCourse(courseId: string): Promise<Flashcard[]>;
  get(id: string): Promise<Flashcard>;
  create(input: FlashcardInput): Promise<Flashcard>;
  update(id: string, patch: Partial<FlashcardInput>): Promise<Flashcard>;
  delete(id: string): Promise<void>;
  recordReview(id: string, difficulty: ReviewHistoryEntry["difficulty"]): Promise<Flashcard>;
}
