import { ServiceError, type Course, type CourseInput, type CourseWithStats } from "@/types";
import { mockStore } from "@/services/_internal/store";
import { simulateRequest, makeId, nowIso } from "@/services/_internal/latency";
import type { CoursesService } from "./courses.service";

export class MockCoursesService implements CoursesService {
  list(): Promise<Course[]> {
    return simulateRequest(() => mockStore.courses.map((c) => ({ ...c })));
  }

  listWithStats(): Promise<CourseWithStats[]> {
    return simulateRequest(() =>
      mockStore.courses.map<CourseWithStats>((c) => ({
        ...c,
        flashcardCount: mockStore.flashcards.reduce((acc, f) => (f.courseId === c.id ? acc + 1 : acc), 0),
        summaryCount: mockStore.summaries.reduce((acc, s) => (s.courseId === c.id ? acc + 1 : acc), 0),
      })),
    );
  }

  get(id: string): Promise<Course> {
    return simulateRequest(() => {
      const c = mockStore.courses.find((c) => c.id === id);
      if (!c) throw new ServiceError(`Course ${id} not found`, "not_found");
      return { ...c };
    });
  }

  create(input: CourseInput): Promise<Course> {
    return simulateRequest(() => {
      if (!input.name?.trim()) throw new ServiceError("Course name is required", "validation");
      if (!input.code?.trim()) throw new ServiceError("Course code is required", "validation");
      const course: Course = {
        id: makeId("course"),
        name: input.name.trim(),
        code: input.code.trim(),
        color: input.color,
        emoji: input.emoji,
        description: input.description,
        createdAt: nowIso(),
        lastStudiedAt: input.lastStudiedAt,
      };
      mockStore.courses = [course, ...mockStore.courses];
      return { ...course };
    });
  }

  update(id: string, patch: Partial<CourseInput>): Promise<Course> {
    return simulateRequest(() => {
      const idx = mockStore.courses.findIndex((c) => c.id === id);
      if (idx < 0) throw new ServiceError(`Course ${id} not found`, "not_found");
      const next: Course = { ...mockStore.courses[idx], ...patch };
      mockStore.courses[idx] = next;
      return { ...next };
    });
  }

  delete(id: string): Promise<void> {
    return simulateRequest(() => {
      const before = mockStore.courses.length;
      mockStore.courses = mockStore.courses.filter((c) => c.id !== id);
      if (mockStore.courses.length === before) throw new ServiceError(`Course ${id} not found`, "not_found");
      mockStore.flashcards = mockStore.flashcards.filter((f) => f.courseId !== id);
      mockStore.summaries = mockStore.summaries.filter((s) => s.courseId !== id);
      mockStore.sandboxes.delete(id);
    });
  }

  markStudied(id: string): Promise<Course> {
    return simulateRequest(
      () => {
        const idx = mockStore.courses.findIndex((c) => c.id === id);
        if (idx < 0) throw new ServiceError(`Course ${id} not found`, "not_found");
        mockStore.courses[idx] = { ...mockStore.courses[idx], lastStudiedAt: nowIso() };
        return { ...mockStore.courses[idx] };
      },
      { errorRate: 0 },
    );
  }
}
