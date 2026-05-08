import { ServiceError, type Course, type CourseInput, type CourseWithStats } from "@/types";
import type { CoursesService } from "./courses.service";

const NOT_IMPLEMENTED = (op: string) =>
  new ServiceError(`ApiCoursesService.${op} is not implemented yet — wire this up to the real backend.`, "not_implemented");

export class ApiCoursesService implements CoursesService {
  list(): Promise<Course[]> {
    throw NOT_IMPLEMENTED("list");
  }
  listWithStats(): Promise<CourseWithStats[]> {
    throw NOT_IMPLEMENTED("listWithStats");
  }
  get(_id: string): Promise<Course> {
    throw NOT_IMPLEMENTED("get");
  }
  create(_input: CourseInput): Promise<Course> {
    throw NOT_IMPLEMENTED("create");
  }
  update(_id: string, _patch: Partial<CourseInput>): Promise<Course> {
    throw NOT_IMPLEMENTED("update");
  }
  delete(_id: string): Promise<void> {
    throw NOT_IMPLEMENTED("delete");
  }
  markStudied(_id: string): Promise<Course> {
    throw NOT_IMPLEMENTED("markStudied");
  }
}
