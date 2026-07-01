import * as fs from "fs";
import * as path from "path";
import { CONFIG } from "./config";

/**
 * Per-day API call quota tracker, persisted to disk.
 *
 * Why: Google Search Console URL inspection is capped at 2,000 calls per
 * property per day; Bing Webmaster URL submission is capped at ~100/day.
 * If a script blows past the cap, Google starts returning 429s on every
 * subsequent inspect — and on subsequent script runs that same day. We
 * track usage per UTC day so we stop *before* burning the quota.
 *
 * Storage: a single JSON file per quota name under logs/quota/.
 *   { "date": "2026-05-04", "count": 47 }
 *
 * `date` is the UTC day (so the same file is shared across timezones).
 * If the file's date doesn't match today, we reset to 0 — yesterday's
 * usage doesn't count against today's budget.
 */

interface QuotaState {
  date: string;
  count: number;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function quotaFile(name: string): string {
  const dir = path.join(CONFIG.logsDir, "quota");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${name}.json`);
}

function read(name: string): QuotaState {
  const file = quotaFile(name);
  if (!fs.existsSync(file)) return { date: todayUtc(), count: 0 };
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    // Validate shape — a corrupt ledger (e.g. count as a string) would
    // silently poison the counter (`"x" + 1` → "x1") and defeat the cap.
    if (typeof data?.count !== "number" || typeof data?.date !== "string") {
      return { date: todayUtc(), count: 0 };
    }
    if (data.date !== todayUtc()) return { date: todayUtc(), count: 0 };
    return data as QuotaState;
  } catch {
    return { date: todayUtc(), count: 0 };
  }
}

function write(name: string, state: QuotaState): void {
  // Atomic write (temp + rename) so a crash mid-write can't corrupt the
  // ledger and a concurrent reader never sees a half-written file.
  const file = quotaFile(name);
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, file);
}

export function getQuotaUsed(name: string): number {
  return read(name).count;
}

export function getQuotaRemaining(name: string, dailyLimit: number): number {
  return Math.max(0, dailyLimit - getQuotaUsed(name));
}

/** Returns true if the quota has room for at least `n` more calls today. */
export function checkQuota(name: string, dailyLimit: number, n: number = 1): boolean {
  return getQuotaRemaining(name, dailyLimit) >= n;
}

/** Increment the day's counter by `n` (default 1). */
export function recordQuota(name: string, n: number = 1): void {
  const state = read(name);
  state.count += n;
  write(name, state);
}
