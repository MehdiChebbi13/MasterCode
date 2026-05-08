import { ServiceError, type Flashcard, type FlashcardInput, type ReviewHistoryEntry } from "@/types";
import { mockStore } from "@/services/_internal/store";
import { simulateRequest, makeId, nowIso } from "@/services/_internal/latency";
import type { FlashcardsService } from "./flashcards.service";

const cloneCard = (f: Flashcard): Flashcard => ({
  ...f,
  tags: [...f.tags],
  reviewHistory: f.reviewHistory.map((r) => ({ ...r })),
});

export class MockFlashcardsService implements FlashcardsService {
  listByCourse(courseId: string): Promise<Flashcard[]> {
    return simulateRequest(() => mockStore.flashcards.filter((f) => f.courseId === courseId).map(cloneCard));
  }

  get(id: string): Promise<Flashcard> {
    return simulateRequest(() => {
      const f = mockStore.flashcards.find((f) => f.id === id);
      if (!f) throw new ServiceError(`Flashcard ${id} not found`, "not_found");
      return cloneCard(f);
    });
  }

  create(input: FlashcardInput): Promise<Flashcard> {
    return simulateRequest(() => {
      if (!input.front?.trim()) throw new ServiceError("Front side is required", "validation");
      if (!input.back?.trim()) throw new ServiceError("Back side is required", "validation");
      if (!mockStore.courses.some((c) => c.id === input.courseId)) {
        throw new ServiceError(`Course ${input.courseId} does not exist`, "not_found");
      }
      const card: Flashcard = {
        id: makeId("fc"),
        courseId: input.courseId,
        front: input.front.trim(),
        back: input.back.trim(),
        tags: input.tags ?? [],
        reviewHistory: [],
      };
      mockStore.flashcards = [card, ...mockStore.flashcards];
      return cloneCard(card);
    });
  }

  update(id: string, patch: Partial<FlashcardInput>): Promise<Flashcard> {
    return simulateRequest(() => {
      const idx = mockStore.flashcards.findIndex((f) => f.id === id);
      if (idx < 0) throw new ServiceError(`Flashcard ${id} not found`, "not_found");
      const next: Flashcard = { ...mockStore.flashcards[idx], ...patch };
      mockStore.flashcards[idx] = next;
      return cloneCard(next);
    });
  }

  delete(id: string): Promise<void> {
    return simulateRequest(() => {
      const before = mockStore.flashcards.length;
      mockStore.flashcards = mockStore.flashcards.filter((f) => f.id !== id);
      if (mockStore.flashcards.length === before) throw new ServiceError(`Flashcard ${id} not found`, "not_found");
    });
  }

  recordReview(id: string, difficulty: ReviewHistoryEntry["difficulty"]): Promise<Flashcard> {
    return simulateRequest(
      () => {
        const idx = mockStore.flashcards.findIndex((f) => f.id === id);
        if (idx < 0) throw new ServiceError(`Flashcard ${id} not found`, "not_found");
        const entry: ReviewHistoryEntry = { reviewedAt: nowIso(), difficulty };
        mockStore.flashcards[idx] = {
          ...mockStore.flashcards[idx],
          reviewHistory: [...mockStore.flashcards[idx].reviewHistory, entry],
        };
        return cloneCard(mockStore.flashcards[idx]);
      },
      { errorRate: 0 },
    );
  }
}
