import { dataSource } from "@/services/_internal/dataSource";
import { MockCoursesService } from "./courses.mock";
import { ApiCoursesService } from "./courses.api";
import type { CoursesService } from "./courses.service";

let instance: CoursesService | null = null;

export function getCoursesService(): CoursesService {
  if (instance) return instance;
  instance = dataSource() === "api" ? new ApiCoursesService() : new MockCoursesService();
  return instance;
}

export function _resetCoursesServiceForTests(): void {
  instance = null;
}

export type { CoursesService } from "./courses.service";
