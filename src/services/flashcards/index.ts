import { dataSource } from "@/services/_internal/dataSource";
import { MockFlashcardsService } from "./flashcards.mock";
import { ApiFlashcardsService } from "./flashcards.api";
import type { FlashcardsService } from "./flashcards.service";

let instance: FlashcardsService | null = null;

export function getFlashcardsService(): FlashcardsService {
  if (instance) return instance;
  instance = dataSource() === "api" ? new ApiFlashcardsService() : new MockFlashcardsService();
  return instance;
}

export function _resetFlashcardsServiceForTests(): void {
  instance = null;
}

export type { FlashcardsService } from "./flashcards.service";
