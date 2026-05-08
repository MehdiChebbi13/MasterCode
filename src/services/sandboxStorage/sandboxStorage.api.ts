import { ServiceError, type SandboxState } from "@/types";
import type { SandboxStorageService } from "./sandboxStorage.service";

const NOT_IMPLEMENTED = (op: string) =>
  new ServiceError(`ApiSandboxStorageService.${op} is not implemented yet — wire this up to the real backend.`, "not_implemented");

export class ApiSandboxStorageService implements SandboxStorageService {
  get(_courseId: string): Promise<SandboxState | null> {
    throw NOT_IMPLEMENTED("get");
  }
  save(_state: SandboxState): Promise<void> {
    throw NOT_IMPLEMENTED("save");
  }
  clear(_courseId: string): Promise<void> {
    throw NOT_IMPLEMENTED("clear");
  }
}
