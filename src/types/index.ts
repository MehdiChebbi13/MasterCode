export interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  emoji?: string;
  description?: string;
  createdAt: string;
  lastStudiedAt?: string;
}

export interface CourseWithStats extends Course {
  flashcardCount: number;
  summaryCount: number;
}

export interface Flashcard {
  id: string;
  courseId: string;
  front: string;
  back: string;
  tags: string[];
  reviewHistory: ReviewHistoryEntry[];
}

export interface ReviewHistoryEntry {
  reviewedAt: string;
  difficulty: 1 | 2 | 3 | 4;
}

export interface Summary {
  id: string;
  courseId: string;
  chapter: number;
  title: string;
  contentMarkdown: string;
  createdAt: string;
  updatedAt: string;
}

export type ExplainMode = "summary" | "code";

export interface AIExplainRequest {
  selection: string;
  context?: string;
  mode: ExplainMode;
  language?: string;
}

export interface AIExplainResponse {
  explanation: string;
  followUps?: string[];
}

export interface AIExplainStreamChunk {
  delta: string;
  done: boolean;
  followUps?: string[];
}

export type SandboxTemplate = "vanilla-ts" | "react-ts" | "python";

export interface SandboxState {
  courseId: string;
  template: SandboxTemplate;
  files: Record<string, string>;
  updatedAt: string;
}

export type CourseInput = Omit<Course, "id" | "createdAt" | "lastStudiedAt"> & {
  lastStudiedAt?: string;
};

export type FlashcardInput = Omit<Flashcard, "id" | "reviewHistory">;

export type SummaryInput = Omit<Summary, "id" | "createdAt" | "updatedAt">;

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "not_found"
      | "validation"
      | "rate_limit"
      | "transient"
      | "not_implemented"
      | "unknown",
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
