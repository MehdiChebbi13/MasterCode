import { ServiceError, type Summary, type SummaryInput } from "@/types";
import type { SummariesService } from "./summaries.service";

const NOT_IMPLEMENTED = (op: string) =>
  new ServiceError(`ApiSummariesService.${op} is not implemented yet — wire this up to the real backend.`, "not_implemented");

export class ApiSummariesService implements SummariesService {
  listByCourse(_courseId: string): Promise<Summary[]> {
    throw NOT_IMPLEMENTED("listByCourse");
  }
  get(_id: string): Promise<Summary> {
    throw NOT_IMPLEMENTED("get");
  }
  create(_input: SummaryInput): Promise<Summary> {
    throw NOT_IMPLEMENTED("create");
  }
  update(_id: string, _patch: Partial<SummaryInput>): Promise<Summary> {
    throw NOT_IMPLEMENTED("update");
  }
  delete(_id: string): Promise<void> {
    throw NOT_IMPLEMENTED("delete");
  }
}
