#!/usr/bin/env tsx
/**
 * Generate src/.generated/page-dates.json from git history.
 *
 * Why this exists:
 *   Vercel does a shallow git clone (--depth=10) by default. If sitemap.ts
 *   runs `git log` at build time, files unedited within the last 10 commits
 *   appear as "added at the shallow-graft root" — every old page gets the
 *   same wrong date. Running this script LOCALLY (where the full history is
 *   available) and committing the JSON eliminates that problem: Vercel just
 *   reads a static file at build time.
 *
 * Workflow:
 *   1. Edit code, commit.
 *   2. Run `npm run gen:page-dates`.
 *   3. Commit the regenerated src/.generated/page-dates.json.
 *   4. Push.
 *
 * Merge behaviour:
 *   If we're somehow run in a shallow context (e.g. CI), the script merges
 *   new entries into the existing JSON rather than overwriting — preserving
 *   accurate historical dates already on disk.
 */

import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";

const OUTPUT_PATH = "src/.generated/page-dates.json";

/* Only include files that the sitemap might reference. Keeps the JSON small
   and the diff clean. Currently: every .tsx in src/app/ and every .ts in
   src/lib/. Expand if a future sitemap entry needs a new source. */
const isRelevant = (p: string): boolean =>
  (p.startsWith("src/app/") && p.endsWith(".tsx")) ||
  (p.startsWith("src/lib/") && p.endsWith(".ts"));

/* "No-bump" commit prefixes — these commits touched the file but did NOT
   materially change what a reader sees. Per John Mueller (Reddit, April
   2025): "Setting today's date in a sitemap file isn't going to help anyone.
   It's just lazy. It makes it harder for search engines to spot truly
   updated pages." And Google sitemap docs: "An update to the main content,
   structured data, or links on the page is generally considered significant,
   however an update to the copyright date is not."

   We use Conventional Commits prefixes (chore/style/refactor/docs/test/
   build/ci) plus an explicit `[no-bump]` escape hatch. Default is to bump —
   a developer who forgets to mark a refactor as `refactor:` will over-emit
   freshness signal (recoverable), whereas mis-classifying a content change
   as `chore:` would under-emit it (also recoverable on next material edit).
   The asymmetry favours occasionally noisy bumps over silently-stale pages.

   Known gaps: free-form subjects like "freshness pipeline: ..." or
   "Wave 9 — ..." don't match the Conventional-Commits prefix and DO count
   as material. This is intentional — a free-form subject usually means a
   genuine feature/fix, and the few cases where it's actually a no-bump
   refactor are easy to flag with `[no-bump]` in the subject. Don't add
   "infra:" / "feat:" / "fix:" to this list — those routinely DO change
   user-visible output and should bump. */
const NO_BUMP_PREFIX_RE = /^(chore|style|refactor|docs|test|build|ci)(\([^)]*\))?!?:/i;
function isNoBumpCommit(subject: string): boolean {
  if (subject.includes("[no-bump]")) return true;
  return NO_BUMP_PREFIX_RE.test(subject);
}

function isShallow(): boolean {
  try {
    return (
      execSync("git rev-parse --is-shallow-repository", {
        encoding: "utf8",
      }).trim() === "true"
    );
  } catch {
    return false;
  }
}

function tryUnshallow(): void {
  try {
    execSync("git fetch --unshallow --no-tags", { stdio: "ignore" });
  } catch {
    // ignore — may not be possible (no remote, no auth)
  }
}

function listTrackedRelevantFiles(): string[] {
  const out = execSync(`git ls-files src/app src/lib`, {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  return out
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p && isRelevant(p));
}

/* `git log --follow` traces single-file renames via similarity scoring
   (default 50%) but silently breaks on splits (one file → many), merges
   (many → one), or rename-plus-heavy-edit in the same commit where the
   similarity falls below threshold. For those refactors we let the
   committer leave a `Renamed-From: <old-path>` trailer in the commit
   message, and the generator chains through to pick up the prior history.
   Pattern is Kubernetes/Linux-kernel-style. Robust to multiple trailers
   per commit and to paths with whitespace. */
const RENAMED_FROM_RE = /^Renamed-From:\s+(.+?)\s*$/im;
function findRenamedFrom(commitSha: string): string | null {
  try {
    const body = execSync(`git log -1 --format=%B ${commitSha}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const m = body.match(RENAMED_FROM_RE);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

/* Per-file log: most recent MATERIAL (non-no-bump) commit and the SHA list
   we walked, so a chained Renamed-From: lookup can pick up where this left
   off when --follow doesn't catch a rename. */
function rawHistoryFor(path: string): Array<{ date: string; subject: string; sha: string }> {
  try {
    const raw = execSync(
      `git log --follow --format=%cI%x00%s%x00%H --diff-filter=AMR -- "${path}"`,
      { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
    );
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("\x00");
        return { date: parts[0] ?? "", subject: parts[1] ?? "", sha: parts[2] ?? "" };
      })
      .filter((e) => e.date && e.sha);
  } catch {
    return [];
  }
}

function buildDateMap(): Record<string, string> {
  /* For each currently-tracked relevant file, fetch the most recent
     MATERIAL commit that touched its content. Material means: not a
     Conventional-Commits no-bump prefix (chore/style/refactor/docs/test/
     build/ci) and not tagged `[no-bump]`. `--follow` traces renames;
     `--diff-filter=AMR` restricts to add/modify/rename. If every commit
     touching the file is no-bump (unusual — would mean the file was only
     ever introduced via a chore-style commit), we fall back to the oldest
     commit so the file still has a date.

     If the file's history bottoms out at a creation commit but that commit
     carries a `Renamed-From: <path>` trailer, we chain into the prior
     file's history transparently — the result is "this content's last
     real edit," not "this filename's last edit."

     Cost: ~5–10s for ~90 files; runs once per push via the pre-push hook
     and once per CI build, so acceptable. */
  const files = listTrackedRelevantFiles();
  const map: Record<string, string> = {};
  for (const path of files) {
    const date = resolveFileDate(path, new Set());
    if (date) map[path] = date;
  }
  return map;
}

function resolveFileDate(path: string, visited: Set<string>): string | undefined {
  if (visited.has(path)) return undefined; // cycle guard
  visited.add(path);

  const history = rawHistoryFor(path);
  if (history.length === 0) return undefined;

  for (const entry of history) {
    if (!isNoBumpCommit(entry.subject)) return entry.date;
  }
  // Every commit was no-bump. Before giving up to the oldest commit,
  // check if the oldest (creation) commit declares a Renamed-From.
  const oldest = history[history.length - 1];
  const priorPath = findRenamedFrom(oldest.sha);
  if (priorPath && priorPath !== path) {
    const chained = resolveFileDate(priorPath, visited);
    if (chained) return chained;
  }
  return oldest.date;
}

function loadExisting(): Record<string, string> {
  if (!existsSync(OUTPUT_PATH)) return {};
  try {
    return JSON.parse(readFileSync(OUTPUT_PATH, "utf8"));
  } catch {
    console.warn(
      `[gen:page-dates] WARNING: ${OUTPUT_PATH} exists but is invalid JSON. Starting from empty.`,
    );
    return {};
  }
}

function main(): void {
  if (isShallow()) {
    console.log("[gen:page-dates] git is shallow — attempting unshallow…");
    tryUnshallow();
    if (isShallow()) {
      console.warn(
        "[gen:page-dates] WARNING: still shallow. New entries will MERGE into existing JSON to avoid overwriting accurate older dates.",
      );
    }
  }

  const fresh = buildDateMap();

  if (Object.keys(fresh).length === 0) {
    console.warn(
      "[gen:page-dates] WARNING: 0 tracked source files found — src/ is uncommitted or a shallow clone; " +
        "every route will fall back to the blanket CONTENT_LAST_MODIFIED. Commit src/ then re-run.",
    );
  }

  const existing = loadExisting();

  /* Merge: new entries override (a newer commit moved a file's date forward
     after the last regen); existing entries kept for files not visible in
     current scan (e.g. shallow context). */
  const merged: Record<string, string> = { ...existing, ...fresh };

  /* Sort keys alphabetically for stable diffs. */
  const sorted: Record<string, string> = {};
  for (const key of Object.keys(merged).sort()) {
    sorted[key] = merged[key];
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(sorted, null, 2) + "\n");

  const total = Object.keys(sorted).length;
  const freshCount = Object.keys(fresh).length;
  const newEntries = Object.keys(fresh).filter((k) => !existing[k]).length;
  const updated = Object.keys(fresh).filter(
    (k) => existing[k] && existing[k] !== fresh[k],
  ).length;

  console.log(
    `[gen:page-dates] ${OUTPUT_PATH}: ${total} entries (${freshCount} from current git, ${newEntries} new, ${updated} updated).`,
  );
}

main();
