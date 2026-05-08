import { dataSource } from "@/services/_internal/dataSource";
import { MockSandboxStorageService } from "./sandboxStorage.mock";
import { ApiSandboxStorageService } from "./sandboxStorage.api";
import type { SandboxStorageService } from "./sandboxStorage.service";

let instance: SandboxStorageService | null = null;

export function getSandboxStorageService(): SandboxStorageService {
  if (instance) return instance;
  instance = dataSource() === "api" ? new ApiSandboxStorageService() : new MockSandboxStorageService();
  return instance;
}

export function _resetSandboxStorageServiceForTests(): void {
  instance = null;
}

export type { SandboxStorageService } from "./sandboxStorage.service";
