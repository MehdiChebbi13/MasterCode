import type { Summary, SummaryInput } from "@/types";

export interface SummariesService {
  listByCourse(courseId: string): Promise<Summary[]>;
  get(id: string): Promise<Summary>;
  create(input: SummaryInput): Promise<Summary>;
  update(id: string, patch: Partial<SummaryInput>): Promise<Summary>;
  delete(id: string): Promise<void>;
}
