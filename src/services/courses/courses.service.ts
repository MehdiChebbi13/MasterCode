import type { Course, CourseInput, CourseWithStats } from "@/types";

export interface CoursesService {
  list(): Promise<Course[]>;
  listWithStats(): Promise<CourseWithStats[]>;
  get(id: string): Promise<Course>;
  create(input: CourseInput): Promise<Course>;
  update(id: string, patch: Partial<CourseInput>): Promise<Course>;
  delete(id: string): Promise<void>;
  markStudied(id: string): Promise<Course>;
}
