import { dataSource } from "@/services/_internal/dataSource";
import { MockSummariesService } from "./summaries.mock";
import { ApiSummariesService } from "./summaries.api";
import type { SummariesService } from "./summaries.service";

let instance: SummariesService | null = null;

export function getSummariesService(): SummariesService {
  if (instance) return instance;
  instance = dataSource() === "api" ? new ApiSummariesService() : new MockSummariesService();
  return instance;
}

export function _resetSummariesServiceForTests(): void {
  instance = null;
}

export type { SummariesService } from "./summaries.service";
