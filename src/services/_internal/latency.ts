import { ServiceError } from "@/types";

const DEFAULT_MIN_MS = 200;
const DEFAULT_MAX_MS = 600;
const DEFAULT_ERROR_RATE = 0.04;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export interface SimulateOptions {
  minMs?: number;
  maxMs?: number;
  errorRate?: number;
  errorMessage?: string;
}

export async function simulateRequest<T>(work: () => T | Promise<T>, opts: SimulateOptions = {}): Promise<T> {
  const minMs = opts.minMs ?? DEFAULT_MIN_MS;
  const maxMs = opts.maxMs ?? DEFAULT_MAX_MS;
  const errorRate = opts.errorRate ?? DEFAULT_ERROR_RATE;
  await sleep(rand(minMs, maxMs));
  if (Math.random() < errorRate) {
    throw new ServiceError(opts.errorMessage ?? "The mock service hit a transient error. Try again.", "transient");
  }
  return work();
}

export async function* simulateStream<T>(chunks: T[], opts: { perChunkMinMs?: number; perChunkMaxMs?: number } = {}): AsyncGenerator<T> {
  const minMs = opts.perChunkMinMs ?? 35;
  const maxMs = opts.perChunkMaxMs ?? 90;
  for (const chunk of chunks) {
    await sleep(rand(minMs, maxMs));
    yield chunk;
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
