import { ServiceError, type Summary, type SummaryInput } from "@/types";
import { mockStore } from "@/services/_internal/store";
import { simulateRequest, makeId, nowIso } from "@/services/_internal/latency";
import type { SummariesService } from "./summaries.service";

export class MockSummariesService implements SummariesService {
  listByCourse(courseId: string): Promise<Summary[]> {
    return simulateRequest(() =>
      mockStore.summaries
        .filter((s) => s.courseId === courseId)
        .map((s) => ({ ...s }))
        .sort((a, b) => a.chapter - b.chapter),
    );
  }

  get(id: string): Promise<Summary> {
    return simulateRequest(() => {
      const s = mockStore.summaries.find((s) => s.id === id);
      if (!s) throw new ServiceError(`Summary ${id} not found`, "not_found");
      return { ...s };
    });
  }

  create(input: SummaryInput): Promise<Summary> {
    return simulateRequest(() => {
      if (!input.title?.trim()) throw new ServiceError("Title is required", "validation");
      if (input.contentMarkdown == null) throw new ServiceError("Markdown content is required", "validation");
      if (!mockStore.courses.some((c) => c.id === input.courseId)) {
        throw new ServiceError(`Course ${input.courseId} does not exist`, "not_found");
      }
      const summary: Summary = {
        id: makeId("sum"),
        courseId: input.courseId,
        chapter: input.chapter,
        title: input.title.trim(),
        contentMarkdown: input.contentMarkdown,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      mockStore.summaries = [summary, ...mockStore.summaries];
      return { ...summary };
    });
  }

  update(id: string, patch: Partial<SummaryInput>): Promise<Summary> {
    return simulateRequest(() => {
      const idx = mockStore.summaries.findIndex((s) => s.id === id);
      if (idx < 0) throw new ServiceError(`Summary ${id} not found`, "not_found");
      const next: Summary = { ...mockStore.summaries[idx], ...patch, updatedAt: nowIso() };
      mockStore.summaries[idx] = next;
      return { ...next };
    });
  }

  delete(id: string): Promise<void> {
    return simulateRequest(() => {
      const before = mockStore.summaries.length;
      mockStore.summaries = mockStore.summaries.filter((s) => s.id !== id);
      if (mockStore.summaries.length === before) throw new ServiceError(`Summary ${id} not found`, "not_found");
    });
  }
}
