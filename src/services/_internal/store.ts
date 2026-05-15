import type { Course, Flashcard, Summary, SandboxState } from "@/types";
import { SEED_COURSES, SEED_FLASHCARDS, SEED_SUMMARIES } from "@/services/_mockData/seed";

class MockStore {
  courses: Course[];
  flashcards: Flashcard[];
  summaries: Summary[];
  sandboxes: Map<string, SandboxState>;

  constructor() {
    this.courses = SEED_COURSES.map((c) => ({ ...c }));
    this.flashcards = SEED_FLASHCARDS.map((f) => ({ ...f, tags: [...f.tags], reviewHistory: f.reviewHistory.map((r) => ({ ...r })) }));
    this.summaries = SEED_SUMMARIES.map((s) => ({
      ...s,
      recallCards: s.recallCards ? s.recallCards.map((c) => ({ ...c })) : [],
    }));
    this.sandboxes = new Map();
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __csStudyHubMockStore: MockStore | undefined;
}

export const mockStore: MockStore =
  globalThis.__csStudyHubMockStore ?? (globalThis.__csStudyHubMockStore = new MockStore());
