import { ServiceError, type Flashcard, type FlashcardInput, type ReviewHistoryEntry } from "@/types";
import type { FlashcardsService } from "./flashcards.service";

const NOT_IMPLEMENTED = (op: string) =>
  new ServiceError(`ApiFlashcardsService.${op} is not implemented yet — wire this up to the real backend.`, "not_implemented");

export class ApiFlashcardsService implements FlashcardsService {
  listByCourse(_courseId: string): Promise<Flashcard[]> {
    throw NOT_IMPLEMENTED("listByCourse");
  }
  get(_id: string): Promise<Flashcard> {
    throw NOT_IMPLEMENTED("get");
  }
  create(_input: FlashcardInput): Promise<Flashcard> {
    throw NOT_IMPLEMENTED("create");
  }
  update(_id: string, _patch: Partial<FlashcardInput>): Promise<Flashcard> {
    throw NOT_IMPLEMENTED("update");
  }
  delete(_id: string): Promise<void> {
    throw NOT_IMPLEMENTED("delete");
  }
  recordReview(_id: string, _difficulty: ReviewHistoryEntry["difficulty"]): Promise<Flashcard> {
    throw NOT_IMPLEMENTED("recordReview");
  }
}
