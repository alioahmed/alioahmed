#!/usr/bin/env tsx
/**
 * Indexing drift monitor — compares Google's last crawl time against our
 * emitted lastmod for tier-1 URLs.
 *
 * Why:
 *   The freshness pipeline only does its job if Google actually picks up
 *   the dates we're emitting. If a sitemap claims lastmod = 2026-05-17 but
 *   Google's `lastCrawlTime` for the same URL is 2026-04-01, our signal is
 *   either being ignored or the page is in some kind of crawl jail. We
 *   want to know FAST — before the SERP loses freshness boost on
 *   high-value queries.
 *
 *   Pattern is the Wayfair-style post-deploy drift monitor (their 2017
 *   public eng-blog post is one of the few documented examples). For our
 *   ~30 tier-1 URLs we can inspect all of them on every run; quota is
 *   2000/day and we use < 1.5% of it.
 *
 *   Runs in CI as a scheduled cron (Sundays). For local runs, requires
 *   credentials/google-service-account.json the same way gsc-submit.ts
 *   does.
 *
 * Output:
 *   - Per-URL row: emitted-date vs google-crawl-date vs drift-days.
 *   - Summary: count above DRIFT_WARN_DAYS / DRIFT_FAIL_DAYS.
 *   - Exit 0 unless any URL crosses DRIFT_FAIL_DAYS (so the monitor
 *     can page someone via GitHub Action failure → email).
 */

import { readFileSync, existsSync } from "node:fs";
import { CONFIG } from "./lib/config";
import { getAuditPages } from "./lib/pages";
import { getAccessToken, SCOPES } from "./lib/auth";
import { fetchWithRetry } from "./lib/fetcher";
import { getQuotaRemaining, recordQuota } from "./lib/quota";
import { Logger, getLatestLog, loadLog } from "./lib/logger";

const DRIFT_WARN_DAYS = 14;
const DRIFT_FAIL_DAYS = 30;

/* Tier-1 URLs we care about most — the entity-defining pages a journalist or
   AI engine might cite. Only the home route is live today; add high-value
   pages here as they ship. Quota is 2000/day so there is ample headroom. */
const TIER_1_PATHS = ["/"] as const;

// Default = the tier-1 set above (fast). Pass --all to inspect every page in
// the sitemap (full indexing coverage; quota-capped below). getAuditPages() is
// async, so --all resolves in main().
const WANT_ALL = process.argv.includes("--all");
let INSPECT_PATHS: string[] = [...TIER_1_PATHS];

interface DriftRow {
  path: string;
  emittedIso: string | null;
  googleIso: string | null;
  verdict: string | null;
  coverageState: string | null;
  driftDays: number | null;
}

/**
 * Emitted lastmod per inspected ROUTE, derived from the git snapshot
 * (src/.generated/page-dates.json), mapping each route to its page.tsx — the
 * same source sitemap.ts uses. Returns {} when the snapshot is absent/empty.
 */
function loadEmittedDates(): Record<string, string> {
  const p = "src/.generated/page-dates.json";
  if (!existsSync(p)) return {};
  let map: Record<string, string>;
  try {
    map = JSON.parse(readFileSync(p, "utf8")) as Record<string, string>;
  } catch {
    return {};
  }
  const out: Record<string, string> = {};
  for (const route of INSPECT_PATHS) {
    const clean = route.replace(/\/+$/, "");
    const file = clean === "" ? "src/app/page.tsx" : `src/app${clean}/page.tsx`;
    if (map[file]) out[route] = map[file];
  }
  return out;
}

async function inspectUrl(
  token: string,
  siteUrl: string,
): Promise<{
  verdict: string | null;
  coverageState: string | null;
  lastCrawlTime: string | null;
}> {
  const res = await fetchWithRetry(
    CONFIG.gscInspectUrl,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inspectionUrl: siteUrl,
        siteUrl: CONFIG.gscSite,
      }),
    },
    { rateLimit: 50 },
  );
  if (!res.ok) {
    return {
      verdict: `HTTP ${res.status}`,
      coverageState: null,
      lastCrawlTime: null,
    };
  }
  const data = (await res.json()) as {
    inspectionResult?: {
      indexStatusResult?: {
        verdict?: string;
        coverageState?: string;
        lastCrawlTime?: string;
      };
    };
  };
  const r = data.inspectionResult?.indexStatusResult;
  return {
    verdict: r?.verdict ?? null,
    coverageState: r?.coverageState ?? null,
    lastCrawlTime: r?.lastCrawlTime ?? null,
  };
}

function driftDaysBetween(emittedIso: string, googleIso: string): number {
  const e = new Date(emittedIso).getTime();
  const g = new Date(googleIso).getTime();
  if (Number.isNaN(e) || Number.isNaN(g)) return 0;
  return Math.round((e - g) / (1000 * 60 * 60 * 24));
}

interface DriftCounts {
  failCount: number;
  neverCrawledCount: number;
  nonPassCount: number;
  warnCount: number;
}

/**
 * Load the previous run's headline counts from the most recent saved log,
 * via getLatestLog + loadLog. Counts live under the log's `summary`. Returns
 * null when no prior run (or no usable summary) is found.
 */
function loadPreviousCounts(): DriftCounts | null {
  const latest = getLatestLog("gsc", "check-indexing-drift");
  if (!latest) return null;
  const log = loadLog(latest);
  const summary = log?.summary as Record<string, unknown> | undefined;
  if (!summary) return null;
  const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);
  return {
    failCount: num(summary.failCount),
    neverCrawledCount: num(summary.neverCrawledCount),
    nonPassCount: num(summary.nonPassCount),
    warnCount: num(summary.warnCount),
  };
}

async function main(): Promise<void> {
  // DORMANT guard: no Google service-account credentials → no-op with a notice.
  if (!existsSync(CONFIG.credentialsPath)) {
    console.log(
      `::notice:: [check-indexing-drift] No Google service-account credentials at ${CONFIG.credentialsPath}. Skipping — dormant until GSC access is configured.`,
    );
    return;
  }

  if (WANT_ALL) {
    try {
      INSPECT_PATHS = await getAuditPages();
    } catch {
      /* keep tier-1 fallback */
    }
  }

  const emitted = loadEmittedDates();
  if (Object.keys(emitted).length === 0) {
    console.error(
      "[check-indexing-drift] src/.generated/page-dates.json not found or empty. Run npm run gen:page-dates.",
    );
    process.exit(2);
  }

  const logger = new Logger("gsc", "check-indexing-drift");

  // Load the previous run's headline counts (if any) for Δ-vs-last-run output.
  const prevCounts = loadPreviousCounts();

  const token = await getAccessToken(SCOPES.webmasters);
  const rows: DriftRow[] = [];

  // Share the 2000/day GSC URL-Inspection ledger with gsc-submit (same key)
  // so a big inspect earlier today can't let this run silently blow the cap.
  const QUOTA_NAME = "gsc-inspect";
  const remaining = getQuotaRemaining(QUOTA_NAME, CONFIG.gscInspectionDailyLimit);
  const targets =
    remaining < INSPECT_PATHS.length ? INSPECT_PATHS.slice(0, Math.max(0, remaining)) : INSPECT_PATHS;

  // Quota fully exhausted → we'd inspect nothing. A zero-target run that exits 0
  // looks identical to a clean pass, hiding the fact that nothing was checked.
  // Emit a distinct WARN, persist it, and exit non-zero so CI surfaces it.
  if (targets.length === 0) {
    console.warn(
      `[check-indexing-drift] WARN: GSC inspection quota exhausted (${remaining}/${CONFIG.gscInspectionDailyLimit} left) — 0 tier-1 URLs inspected this run. This is NOT a clean pass; nothing was checked.`,
    );
    logger.warn(
      `Quota exhausted: 0/${INSPECT_PATHS.length} URLs inspected (${remaining}/${CONFIG.gscInspectionDailyLimit} quota left).`,
    );
    logger.save({
      failCount: 0,
      neverCrawledCount: 0,
      nonPassCount: 0,
      warnCount: 0,
      rows: [],
      quotaExhausted: true,
    });
    process.exit(1);
  }

  if (targets.length < INSPECT_PATHS.length) {
    console.warn(
      `[check-indexing-drift] GSC inspection quota low: ${remaining}/${CONFIG.gscInspectionDailyLimit} left — inspecting ${targets.length}/${INSPECT_PATHS.length} URLs this run.`,
    );
  }

  console.log(
    `[check-indexing-drift] Inspecting ${targets.length} tier-1 URLs against Google's last crawl time...`,
  );
  console.log("");
  console.log(
    "  PATH                                              EMITTED      GOOGLE       DRIFT  VERDICT",
  );
  console.log(
    "  ------------------------------------------------- ------------ ------------ ------ -------------------",
  );

  let warnCount = 0;
  let failCount = 0;
  let neverCrawledCount = 0;
  let nonPassCount = 0;

  for (const path of targets) {
    const siteUrl = `${CONFIG.siteUrl}${path}`;
    const emittedIso = emitted[path] ?? null;

    const insp = await inspectUrl(token, siteUrl);
    recordQuota(QUOTA_NAME);
    const drift =
      emittedIso && insp.lastCrawlTime
        ? driftDaysBetween(emittedIso, insp.lastCrawlTime)
        : null;

    rows.push({
      path,
      emittedIso,
      googleIso: insp.lastCrawlTime,
      verdict: insp.verdict,
      coverageState: insp.coverageState,
      driftDays: drift,
    });

    const fmtDate = (iso: string | null) =>
      iso ? new Date(iso).toISOString().slice(0, 10) : "—".padEnd(10);
    const fmtDrift = (d: number | null) => {
      if (d === null) return "  —  ";
      const s = d.toString().padStart(4) + "d";
      return s;
    };

    /* Three failure dimensions, each a separate alarm:
       1. drift >= DRIFT_FAIL_DAYS: emitted lastmod is recent but Google
          hasn't recrawled — distrust or crawl-jail risk.
       2. lastCrawlTime is null: Google has never crawled this URL —
          orphan, robots, or canonical issue. Louder than slow recrawl.
       3. verdict !== "PASS": even if recently crawled, Google decided
          the URL is NEUTRAL / FAIL / etc. — indexing problem we want to
          know about regardless of crawl recency. */
    const isNeverCrawled = emittedIso !== null && insp.lastCrawlTime === null;
    const isNonPass =
      insp.verdict !== null &&
      insp.verdict !== "PASS" &&
      !insp.verdict.startsWith("HTTP ");
    const isDriftFail = drift !== null && drift >= DRIFT_FAIL_DAYS;
    const isDriftWarn =
      drift !== null && drift >= DRIFT_WARN_DAYS && drift < DRIFT_FAIL_DAYS;

    let flag: string;
    if (isDriftFail || isNeverCrawled || isNonPass) flag = "FAIL";
    else if (isDriftWarn) flag = "WARN";
    else if (drift === null) flag = "    ";
    else flag = "OK  ";

    if (isDriftFail) failCount++;
    if (isNeverCrawled) neverCrawledCount++;
    if (isNonPass) nonPassCount++;
    if (isDriftWarn) warnCount++;

    console.log(
      `  ${flag} ${path.padEnd(46)} ${fmtDate(emittedIso)} ${fmtDate(insp.lastCrawlTime)} ${fmtDrift(drift)} ${insp.verdict ?? "—"}${insp.coverageState ? ` (${insp.coverageState})` : ""}`,
    );
  }

  const totalFails = failCount + neverCrawledCount + nonPassCount;
  console.log("");
  console.log(
    `[check-indexing-drift] Summary — ${failCount} drifted ≥${DRIFT_FAIL_DAYS}d, ${neverCrawledCount} never crawled, ${nonPassCount} non-PASS verdicts, ${warnCount} warn-band drift.`,
  );

  // Δ vs last run — only meaningful when we have a prior persisted run.
  if (prevCounts) {
    const d = (curr: number, prev: number) => {
      const diff = curr - prev;
      return `${diff > 0 ? "+" : ""}${diff}`;
    };
    console.log(
      `[check-indexing-drift] Δ vs last run — fail ${d(failCount, prevCounts.failCount)}, never-crawled ${d(neverCrawledCount, prevCounts.neverCrawledCount)}, non-PASS ${d(nonPassCount, prevCounts.nonPassCount)}, warn ${d(warnCount, prevCounts.warnCount)}.`,
    );
  } else {
    console.log("[check-indexing-drift] Δ vs last run — no prior run found (first run).");
  }

  // Persist counts + rows so the next run can show deltas and so CI keeps a trail.
  logger.save({ failCount, neverCrawledCount, nonPassCount, warnCount, rows });

  if (totalFails > 0) {
    console.error("");
    console.error(
      `Action: ${totalFails} tier-1 URL(s) need attention. Possible causes:`,
    );
    console.error("  - sitemap binary distrust: Google ignoring our lastmod (review recent over-bumping)");
    console.error("  - canonical / robots issue suppressing crawl");
    console.error("  - URL is duplicate-of-another canonical → Google crawls the other");
    console.error("  - Manual action / soft-404 / NOINDEX header");
    console.error("Run GSC > URL Inspection on each FAIL URL for the official diagnostic.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`[check-indexing-drift] crash: ${(err as Error).message}`);
  process.exit(2);
});
