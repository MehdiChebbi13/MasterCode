import type { SandboxState } from "@/types";
import { mockStore } from "@/services/_internal/store";
import { simulateRequest } from "@/services/_internal/latency";
import type { SandboxStorageService } from "./sandboxStorage.service";

const STORAGE_PREFIX = "cs-study-hub:sandbox:";

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function readFromLocalStorage(courseId: string): SandboxState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + courseId);
    if (!raw) return null;
    return JSON.parse(raw) as SandboxState;
  } catch {
    return null;
  }
}

function writeToLocalStorage(state: SandboxState) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + state.courseId, JSON.stringify(state));
  } catch {
    // quota or serialization error — fall back to in-memory only
  }
}

function removeFromLocalStorage(courseId: string) {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_PREFIX + courseId);
  } catch {
    // ignore
  }
}

export class MockSandboxStorageService implements SandboxStorageService {
  get(courseId: string): Promise<SandboxState | null> {
    return simulateRequest(
      () => {
        const fromLs = readFromLocalStorage(courseId);
        if (fromLs) {
          mockStore.sandboxes.set(courseId, fromLs);
          return fromLs;
        }
        return mockStore.sandboxes.get(courseId) ?? null;
      },
      { minMs: 60, maxMs: 180, errorRate: 0 },
    );
  }

  save(state: SandboxState): Promise<void> {
    return simulateRequest(
      () => {
        mockStore.sandboxes.set(state.courseId, state);
        writeToLocalStorage(state);
      },
      { minMs: 40, maxMs: 120, errorRate: 0 },
    );
  }

  clear(courseId: string): Promise<void> {
    return simulateRequest(
      () => {
        mockStore.sandboxes.delete(courseId);
        removeFromLocalStorage(courseId);
      },
      { minMs: 40, maxMs: 120, errorRate: 0 },
    );
  }
}
