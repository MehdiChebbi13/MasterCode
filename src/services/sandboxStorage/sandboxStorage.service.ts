import type { SandboxState } from "@/types";

export interface SandboxStorageService {
  get(courseId: string): Promise<SandboxState | null>;
  save(state: SandboxState): Promise<void>;
  clear(courseId: string): Promise<void>;
}
