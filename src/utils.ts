import fs from "node:fs";

/**
 * PHASE C — MINIMAL UTILITIES
 * Pure functional utilities for the orchestration skeleton.
 */

export async function ensureDir(dir: string) {
  await fs.promises.mkdir(dir, { recursive: true });
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function truncateUtf16Safe(input: string, maxLen: number): string {
  const limit = Math.max(0, Math.floor(maxLen));
  if (input.length <= limit) {
    return input;
  }
  return input.slice(0, limit);
}
