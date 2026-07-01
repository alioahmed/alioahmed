#!/usr/bin/env tsx
/**
 * IndexNow change-only submitter.
 *
 * Why this exists separately from `indexnow-submit.ts`:
 *   `indexnow-submit.ts` submits every URL in the sitemap — expensive (~5
 *   minutes for 209 URLs × 6 engines × 250ms delay), and most pushes only
 *   touch a handful of pages. This script computes the diff between the
 *   current `src/.generated/page-dates.json` and the version from the last
 *   real (non-auto-regen) push, then submits ONLY the URLs whose lastmod
 *   actually advanced.
 *
 *   Google deprecated sitemap pings in June 2023; IndexNow is now the only
 *   "tell search engines now" lever for Bing, Yandex, Seznam, Naver, Yep.
 *   We run this on every push to main via GitHub Actions, after the build
 *   succeeds.
 *
 * How "previous JSON" is determined:
 *   The pre-push hook can create a follow-up auto-commit titled
 *   `chore(sitemap): regenerate page-dates.json [auto]`. We walk back
 *   through git history skipping those auto-commits to find the JSON state
 *   from the previous real push — that's the diff baseline.
 *
 * Output:
 *   Submits via the same streaming pattern as indexnow-submit.ts. Exits 0
 *   on success (including the empty case "no URLs to submit"); exits 1 only
 *   if every single endpoint hard-failed, which would indicate a network
 *   or auth problem worth flagging.
 *
 * Usage:
 *   npx tsx scripts/indexnow-on-change.ts
 *   BASE_URL=https://alioahmed.com npx tsx scripts/indexnow-on-change.ts
 *   DRY_RUN=1 npx tsx scripts/indexnow-on-change.ts       # don't actually POST
 */

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { CONFIG } from "./lib/config";
import { INDEXNOW_ENDPOINTS, submitToAllEndpoints } from "./lib/indexnow";
import { parseSitemapEntries } from "./lib/sitemap-parser";

const PAGE_DATES_PATH = "src/.generated/page-dates.json";
const BASE_URL = process.env.BASE_URL?.replace(/\/$/, "") ?? CONFIG.siteUrl;
const DRY_RUN = process.env.DRY_RUN === "1";

// Endpoint list + per-endpoint submit live in ./lib/indexnow (shared with
// indexnow-submit.ts so the two can't drift).

// Match by PREFIX, not exact string: the pre-push hook's actual subject is
// "chore(sitemap): regenerate freshness snapshots" (it drifted from the old
// "...page-dates.json [auto]" wording). An exact-equality check silently
// never matched, so the auto-regen baseline anchor below was dead.
const AUTO_REGEN_SUBJECT_PREFIX = "chore(sitemap): regenerate";

function currentJson(): Record<string, string> {
  if (!existsSync(PAGE_DATES_PATH)) return {};
  return JSON.parse(readFileSync(PAGE_DATES_PATH, "utf8"));
}

/* The diff baseline is the state of page-dates.json at the LAST push's
   final commit on main — i.e. what production saw before this push.
   Resolution order:
     1. $PREV_REF env var — the PRIMARY path in CI, set to
        github.event.before (the SHA before the push). This is how the
        baseline is resolved on every real deploy.
     2. LEGACY local-dev fallback: walk back through git history looking for
        an auto-regen commit. This dates from when the pre-push hook
        auto-committed a regenerated page-dates.json; the hook no longer
        does that, so in CI this branch is effectively dead and only fires
        for manual local runs where PREV_REF isn't set. Heuristic: take the
        most recent auto-regen commit at HEAD~1 or older — that's the
        previous push's terminus. If no auto-regen exists in history (e.g.
        fresh repo or post-hook-change history), fall back to HEAD~1.
     3. Empty (first-ever push). */
function previousJson(): Record<string, string> {
  const explicit = process.env.PREV_REF;
  if (explicit) {
    try {
      const raw = execSync(`git show ${explicit}:${PAGE_DATES_PATH}`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      return JSON.parse(raw);
    } catch {
      console.warn(`[indexnow-on-change] PREV_REF=${explicit} not found in git history; falling back to heuristic.`);
    }
  }
  try {
    const subjects = execSync(`git log --format=%s -50`, { encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
    /* Find the most recent auto-regen commit AT OR BEFORE HEAD~1. That is
       the previous push's last commit on main — its page-dates.json is
       what production currently serves. */
    for (let i = 1; i < subjects.length; i++) {
      if (!subjects[i].startsWith(AUTO_REGEN_SUBJECT_PREFIX)) continue;
      try {
        const raw = execSync(`git show HEAD~${i}:${PAGE_DATES_PATH}`, {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        });
        return JSON.parse(raw);
      } catch {
        continue;
      }
    }
    // No auto-regen in recent history — fall back to HEAD~1.
    const raw = execSync(`git show HEAD~1:${PAGE_DATES_PATH}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function fetchSitemap(): Promise<Array<{ loc: string; lastmod: string | null }>> {
  // Delegate to the shared parser: it follows sitemap indexes, decodes XML
  // entities, and has retry/timeout. The old bare-fetch + hand-rolled regex
  // here crashed on a network blip and silently DROPPED any sitemap entry
  // whose <lastmod> was absent or not immediately adjacent to <loc>.
  return parseSitemapEntries(BASE_URL);
}

function urlPath(loc: string): string {
  const p = loc.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "");
  return p === "" ? "/" : p;
}

/* Map advanced file paths to the exact set of sitemap URLs they consume.
   Static page.tsx → 1 URL. Dynamic page.tsx (`[param]`) → every sitemap URL
   under the static prefix. Content/schema/site library files feed EVERY page
   (the shared entity graph + content layer), so a change there fans out to
   the whole sitemap. Other src/lib/*.ts files are not sitemap data-deps. */
const SITE_WIDE_DEP_RE = /^src\/lib\/(content\/|schema\.ts|site\.ts|metadata\.ts|page-dates\.ts)/;

function affectedUrls(
  advancedFiles: string[],
  sitemap: Array<{ loc: string; lastmod: string | null }>,
): string[] {
  const out = new Set<string>();
  for (const file of advancedFiles) {
    if (file.startsWith("src/app/") && file.endsWith("/page.tsx")) {
      const inner = file.slice("src/app/".length, -"/page.tsx".length);
      if (inner.includes("[")) {
        const prefix = "/" + inner.split("[")[0].replace(/\/+$/, "");
        for (const { loc } of sitemap) {
          const p = urlPath(loc);
          if (p === prefix || p.startsWith(prefix + "/")) out.add(loc);
        }
      } else {
        const targetPath = inner === "" ? "/" : "/" + inner;
        for (const { loc } of sitemap) {
          if (urlPath(loc) === targetPath) out.add(loc);
        }
      }
    } else if (SITE_WIDE_DEP_RE.test(file)) {
      // Shared content/schema dependency — advances every page's output.
      for (const { loc } of sitemap) out.add(loc);
    }
    // Other src/lib/*.ts: not a sitemap data-dep, no URLs to submit.
  }
  return Array.from(out);
}

async function streamSubmit(urls: string[]): Promise<{ totalOks: number; totalCalls: number }> {
  // DRY_RUN is handled in main() (it returns before reaching here), so this
  // path always does a real submit. One URL per batch = streaming.
  let totalOks = 0;
  let totalCalls = 0;
  for (const url of urls) {
    const results = await submitToAllEndpoints([url], { timeout: 15000, maxRetries: 1 });
    let oksThisUrl = 0;
    for (const r of results) {
      totalCalls++;
      if (r.ok) {
        totalOks++;
        oksThisUrl++;
      }
    }
    const path = url.replace(BASE_URL, "");
    console.log(`  ${oksThisUrl === INDEXNOW_ENDPOINTS.length ? "OK  " : oksThisUrl > 0 ? "WARN" : "FAIL"} ${path}  [${oksThisUrl}/${INDEXNOW_ENDPOINTS.length}]`);
    await new Promise((r) => setTimeout(r, 250));
  }
  return { totalOks, totalCalls };
}

async function main(): Promise<void> {
  // DORMANT guard: no IndexNow key → no-op with a clear notice (never crash).
  if (!CONFIG.indexNowKey) {
    console.log(
      "::notice:: [indexnow-on-change] No IndexNow key (set INDEXNOW_KEY or add public/<key>.txt). Skipping — dormant until deploy.",
    );
    return;
  }

  const prev = previousJson();
  const curr = currentJson();
  const advancedFiles = Object.entries(curr).filter(([k, v]) => prev[k] !== v);
  console.log(`[indexnow-on-change] ${advancedFiles.length} source file(s) advanced since last real push.`);
  if (advancedFiles.length === 0) {
    console.log("[indexnow-on-change] Nothing to submit.");
    return;
  }

  const sitemap = await fetchSitemap();
  console.log(`[indexnow-on-change] sitemap.xml: ${sitemap.length} URLs total.`);

  const advancedPaths = advancedFiles.map(([k]) => k);
  const urls = affectedUrls(advancedPaths, sitemap);
  console.log(`[indexnow-on-change] ${urls.length} URL(s) affected by the change.`);
  if (urls.length === 0) return;
  if (DRY_RUN) {
    console.log("[indexnow-on-change] DRY_RUN=1 — printing URLs only:");
    for (const u of urls) console.log("  " + u);
    return;
  }

  const { totalOks, totalCalls } = await streamSubmit(urls);
  console.log(`[indexnow-on-change] Done — ${totalOks}/${totalCalls} endpoint calls succeeded.`);
  if (totalOks === 0 && totalCalls > 0) {
    console.error("[indexnow-on-change] Every endpoint failed. Check connectivity / IndexNow key.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`[indexnow-on-change] crash: ${(err as Error).message}`);
  process.exit(1);
});
