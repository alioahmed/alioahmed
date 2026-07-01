/**
 * Google Search Console Analytics Report — alioahmed
 *
 * Advanced analytics with quick wins, striking distance, cannibalization.
 *
 * USAGE:
 *   npx tsx scripts/gsc-report.ts                  — Full report
 *   npx tsx scripts/gsc-report.ts queries           — Top search queries
 *   npx tsx scripts/gsc-report.ts pages             — Top pages by clicks
 *   npx tsx scripts/gsc-report.ts quick-wins        — High impressions, low CTR
 *   npx tsx scripts/gsc-report.ts striking          — Striking distance keywords
 *   npx tsx scripts/gsc-report.ts cannibalization   — Keyword cannibalization
 *   npx tsx scripts/gsc-report.ts errors            — Pages with issues
 *   npx tsx scripts/gsc-report.ts --help            — Show this help
 */

import * as fs from "fs";
import * as path from "path";
import { CONFIG } from "./lib/config";
import { getAccessToken, SCOPES } from "./lib/auth";
import { fetchWithRetry } from "./lib/fetcher";
import { Logger, getLatestLog, loadLog } from "./lib/logger";
import type {
  SearchAnalyticsRow,
  QuickWin,
  StrikingDistance,
  Cannibalization,
  WeeklySnapshot,
} from "./lib/types";

// Expected CTR by SERP position — Advanced Web Ranking + Backlinko 2023 industry curve.
// Used to estimate "lost clicks" for the PRIORITY ACTIONS section.
const EXPECTED_CTR_BY_POSITION: Record<number, number> = {
  1: 0.275, 2: 0.155, 3: 0.110, 4: 0.080, 5: 0.060,
  6: 0.050, 7: 0.040, 8: 0.032, 9: 0.027, 10: 0.024,
};

function expectedCTR(position: number): number {
  if (position <= 1) return EXPECTED_CTR_BY_POSITION[1];
  if (position >= 11) return Math.max(0.005, 0.024 - (position - 10) * 0.002);
  const lo = Math.floor(position);
  const hi = Math.ceil(position);
  const t = position - lo;
  return EXPECTED_CTR_BY_POSITION[lo] * (1 - t) + EXPECTED_CTR_BY_POSITION[hi] * t;
}

interface PriorityAction {
  page: string;
  position: number;
  impressions: number;
  clicks: number;
  actualCtr: number;
  expectedCtr: number;
  lostClicks: number;
  diagnosis: string;
}

function buildPriorityActions(pageRows: SearchAnalyticsRow[]): PriorityAction[] {
  return pageRows
    .filter((r) => (r.keys ?? []).length > 0)
    .map((r) => {
      const k = r.keys ?? [];
      const expCtr = expectedCTR(r.position);
      const expClicks = r.impressions * expCtr;
      const lost = Math.max(0, expClicks - r.clicks);
      return {
        page: k[0].replace(CONFIG.siteUrl, "") || "/",
        position: r.position,
        impressions: r.impressions,
        clicks: r.clicks,
        actualCtr: r.ctr,
        expectedCtr: expCtr,
        lostClicks: lost,
        diagnosis: r.clicks === 0
          ? "Zero clicks at this position — title/snippet doesn't match query intent"
          : r.ctr < expCtr * 0.5
            ? "CTR below half of expected — rewrite title for stronger hook"
            : "CTR below expected — consider title tightening",
      };
    })
    .filter((p) => p.position <= 15 && p.impressions >= 25 && p.lostClicks >= 5)
    .sort((a, b) => b.lostClicks - a.lostClicks)
    .slice(0, 8);
}

function printPriorityActions(actions: PriorityAction[]): void {
  console.log("\n  PRIORITY ACTIONS THIS WEEK — Pages Losing Most Clicks vs Expected CTR\n");
  console.log("  Criteria: position <= 15, impressions >= 25, lost clicks >= 5 (28d window)\n");

  if (actions.length === 0) {
    console.log("  No priority actions — every page is performing at/above expected CTR.\n");
    return;
  }

  const tableRows = actions.map((a, i) => [
    String(i + 1),
    a.page.substring(0, 50),
    a.position.toFixed(1),
    String(a.impressions),
    `${(a.actualCtr * 100).toFixed(1)}%`,
    `${(a.expectedCtr * 100).toFixed(1)}%`,
    `+${Math.round(a.lostClicks)}`,
  ]);

  printTable(
    ["#", "Page", "Pos", "Impr", "Actual", "Expect", "Lost"],
    [4, 52, 6, 8, 9, 9, 8],
    tableRows,
  );

  console.log("\n  Action: rewrite the <title> + meta description on each page above.");
  console.log("  Wait for Google to recrawl (~3-14 days), then re-run this report.\n");
}

function buildMarkdownReport(
  snapshot: WeeklySnapshot,
  priorityActions: PriorityAction[],
  pageRows: SearchAnalyticsRow[],
  trendLine: string | null = null,
): string {
  const date = new Date().toISOString().split("T")[0];
  const lines: string[] = [];
  lines.push(`# GSC Weekly Report — ${date} (${snapshot.week})`);
  lines.push("");
  lines.push(`**Site:** ${CONFIG.gscSite}`);
  lines.push(`**Window:** last 28 days`);
  lines.push(`**Totals (top 25 queries):** ${snapshot.totalClicks} clicks · ${snapshot.totalImpressions} impressions · ${(snapshot.avgCtr * 100).toFixed(2)}% avg CTR (clicks/impr) · pos ${snapshot.avgPosition.toFixed(1)} (impr-weighted)`);
  if (trendLine) {
    lines.push("");
    lines.push(trendLine);
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  lines.push("## Priority Actions This Week");
  lines.push("");
  lines.push("Pages losing the most clicks vs expected CTR for their position. Fix titles/snippets here first.");
  lines.push("");
  if (priorityActions.length === 0) {
    lines.push("_No priority actions — every page is performing at/above expected CTR._");
  } else {
    lines.push("| # | Page | Pos | Impr | Actual CTR | Expected CTR | Lost clicks | Diagnosis |");
    lines.push("|---|---|---|---|---|---|---|---|");
    priorityActions.forEach((a, i) => {
      lines.push(`| ${i + 1} | \`${a.page}\` | ${a.position.toFixed(1)} | ${a.impressions} | ${(a.actualCtr * 100).toFixed(1)}% | ${(a.expectedCtr * 100).toFixed(1)}% | +${Math.round(a.lostClicks)} | ${a.diagnosis} |`);
    });
  }
  lines.push("");

  lines.push("## Striking Distance (positions 5-20)");
  lines.push("");
  if (snapshot.strikingDistance.length === 0) {
    lines.push("_None._");
  } else {
    lines.push("| Query | Page | Pos | Impr | Clicks |");
    lines.push("|---|---|---|---|---|");
    snapshot.strikingDistance.slice(0, 25).forEach((s) => {
      lines.push(`| ${s.query} | \`${s.page}\` | ${s.position.toFixed(1)} | ${s.impressions} | ${s.clicks} |`);
    });
  }
  lines.push("");

  lines.push("## Quick Wins (query-level)");
  lines.push("");
  if (snapshot.quickWins.length === 0) {
    lines.push("_None._");
  } else {
    lines.push("| Query | Page | Pos | Impr | CTR | Reason |");
    lines.push("|---|---|---|---|---|---|");
    snapshot.quickWins.slice(0, 25).forEach((q) => {
      lines.push(`| ${q.query} | \`${q.page}\` | ${q.position.toFixed(1)} | ${q.impressions} | ${(q.ctr * 100).toFixed(1)}% | ${q.reason} |`);
    });
  }
  lines.push("");

  lines.push("## Cannibalization (top 15)");
  lines.push("");
  if (snapshot.cannibalization.length === 0) {
    lines.push("_None._");
  } else {
    snapshot.cannibalization.slice(0, 15).forEach((c) => {
      lines.push(`**"${c.query}"** — ${c.pages.length} pages competing:`);
      c.pages.forEach((p) => {
        lines.push(`- \`${p.url}\` — pos ${p.position.toFixed(1)}, ${p.clicks} clicks, ${p.impressions} impr`);
      });
      lines.push("");
    });
  }

  lines.push("## Top 25 Pages by Clicks");
  lines.push("");
  lines.push("| Page | Clicks | Impr | CTR | Pos |");
  lines.push("|---|---|---|---|---|");
  pageRows.slice(0, 25).forEach((r) => {
    const k = r.keys ?? [];
    if (k.length === 0) return;
    const page = k[0].replace(CONFIG.siteUrl, "") || "/";
    lines.push(`| \`${page}\` | ${r.clicks} | ${r.impressions} | ${(r.ctr * 100).toFixed(1)}% | ${r.position.toFixed(1)} |`);
  });
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push(`_Generated by \`scripts/gsc-report.ts\` on ${new Date().toISOString()}_`);
  return lines.join("\n");
}

function saveMarkdownReport(content: string): string {
  const dir = path.join(path.resolve(__dirname, ".."), "docs", "reports");
  fs.mkdirSync(dir, { recursive: true });
  const date = new Date().toISOString().split("T")[0];
  const filepath = path.join(dir, `gsc-weekly-${date}.md`);
  fs.writeFileSync(filepath, content);
  return filepath;
}

const HELP = `
  alioahmed — GSC Analytics Report

  Commands:
    (no args)          Full report (all sections)
    queries            Top 25 search queries (last 28 days)
    pages              Top 25 pages by clicks
    quick-wins         High impression queries with low CTR
    striking           Keywords in striking distance (pos 5-20)
    cannibalization    Queries ranking for multiple pages
    errors             Pages with zero clicks or poor ranking

  Examples:
    npx tsx scripts/gsc-report.ts
    npx tsx scripts/gsc-report.ts quick-wins
    npx tsx scripts/gsc-report.ts striking
`;

async function searchAnalytics(
  token: string,
  dimensions: string[],
  rowLimit: number = 25
): Promise<SearchAnalyticsRow[]> {
  // GSC Search Analytics finalises data on a ~2-3 day lag; including the most
  // recent days pulls in partial data that deflates every metric (clicks,
  // impressions, CTR). End the window 3 days back and span the full 28 days
  // before that so week-over-week comparisons are apples-to-apples.
  const DATA_LAG_DAYS = 3;
  const endDate = new Date(Date.now() - DATA_LAG_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const startDate = new Date(Date.now() - (DATA_LAG_DAYS + 28) * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const url = `${CONFIG.gscBaseUrl}/sites/${encodeURIComponent(CONFIG.gscSite)}/searchAnalytics/query`;

  const res = await fetchWithRetry(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions,
      rowLimit,
      type: "web",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Search Analytics API error: ${res.status} — ${text}`);
  }

  const data = await res.json();
  return (data.rows || []) as SearchAnalyticsRow[];
}

function printTable(
  headers: string[],
  widths: number[],
  rows: string[][]
): void {
  const headerLine = headers.map((h, i) => h.padEnd(widths[i])).join("");
  console.log(`  ${headerLine}`);
  console.log(`  ${"-".repeat(widths.reduce((a, b) => a + b, 0))}`);
  for (const row of rows) {
    const line = row.map((cell, i) => cell.padEnd(widths[i])).join("");
    console.log(`  ${line}`);
  }
}

async function reportQueries(logger: Logger): Promise<SearchAnalyticsRow[]> {
  const token = await getAccessToken(SCOPES.readonly);
  const rows = await searchAnalytics(token, ["query"], 25);

  console.log("\n  TOP 25 SEARCH QUERIES (Last 28 Days)\n");

  if (rows.length === 0) {
    logger.warn("No query data yet. Google needs a few days to collect data.");
    return [];
  }

  const tableRows = rows
    .filter((r) => (r.keys ?? []).length > 0)
    .map((r) => [
      (r.keys ?? [])[0].substring(0, 45),
      String(r.clicks),
      String(r.impressions),
      `${(r.ctr * 100).toFixed(1)}%`,
      r.position.toFixed(1),
    ]);

  printTable(
    ["Query", "Clicks", "Impr", "CTR", "Pos"],
    [47, 8, 8, 8, 6],
    tableRows
  );

  logger.info(`Top queries: ${rows.length} results`);
  return rows;
}

async function reportPages(logger: Logger): Promise<SearchAnalyticsRow[]> {
  const token = await getAccessToken(SCOPES.readonly);
  const rows = await searchAnalytics(token, ["page"], 25);

  console.log("\n  TOP 25 PAGES BY CLICKS (Last 28 Days)\n");

  if (rows.length === 0) {
    logger.warn("No page data yet. Google needs a few days to collect data.");
    return [];
  }

  const tableRows = rows
    .filter((r) => (r.keys ?? []).length > 0)
    .map((r) => [
      (r.keys ?? [])[0].replace(CONFIG.siteUrl, "").substring(0, 50) || "/",
      String(r.clicks),
      String(r.impressions),
      `${(r.ctr * 100).toFixed(1)}%`,
      r.position.toFixed(1),
    ]);

  printTable(
    ["Page", "Clicks", "Impr", "CTR", "Pos"],
    [52, 8, 8, 8, 6],
    tableRows
  );

  logger.info(`Top pages: ${rows.length} results`);
  return rows;
}

async function reportQuickWins(
  logger: Logger,
  prefetched?: SearchAnalyticsRow[]
): Promise<QuickWin[]> {
  const rows = prefetched ?? await searchAnalytics(
    await getAccessToken(SCOPES.readonly),
    ["query", "page"],
    500
  );

  console.log("\n  QUICK WINS — High Impressions, Low CTR\n");
  console.log("  Criteria: impressions >= 50, CTR < 3%, position < 15\n");

  const quickWins: QuickWin[] = rows
    .filter(
      (r) =>
        (r.keys ?? []).length >= 2 &&
        r.impressions >= 50 &&
        r.ctr < 0.03 &&
        r.position < 15
    )
    .map((r) => ({
      query: (r.keys ?? [])[0],
      page: (r.keys ?? [])[1].replace(CONFIG.siteUrl, "") || "/",
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: r.ctr,
      position: r.position,
      reason:
        r.ctr === 0
          ? "Zero clicks despite impressions — fix title/description"
          : "Low CTR for position — improve snippet appeal",
    }))
    .sort((a, b) => b.impressions - a.impressions);

  if (quickWins.length === 0) {
    logger.info("No quick wins found. Either not enough data or pages are performing well.");
    return [];
  }

  for (const qw of quickWins) {
    console.log(`  Query: ${qw.query}`);
    console.log(`  Page:  ${qw.page}`);
    console.log(
      `  Stats: ${qw.impressions} impr | ${qw.clicks} clicks | ${(qw.ctr * 100).toFixed(1)}% CTR | pos ${qw.position.toFixed(1)}`
    );
    console.log(`  Action: ${qw.reason}`);
    console.log("");
  }

  logger.info(`Quick wins found: ${quickWins.length}`);
  return quickWins;
}

async function reportStriking(
  logger: Logger,
  prefetched?: SearchAnalyticsRow[]
): Promise<StrikingDistance[]> {
  const rows = prefetched ?? await searchAnalytics(
    await getAccessToken(SCOPES.readonly),
    ["query", "page"],
    500
  );

  console.log("\n  STRIKING DISTANCE — Keywords Close to Page 1\n");
  console.log("  Criteria: position 5-20, impressions >= 10\n");

  const striking: StrikingDistance[] = rows
    .filter(
      (r) =>
        (r.keys ?? []).length >= 2 &&
        r.position >= 5 &&
        r.position <= 20 &&
        r.impressions >= 10
    )
    .map((r) => ({
      query: (r.keys ?? [])[0],
      page: (r.keys ?? [])[1].replace(CONFIG.siteUrl, "") || "/",
      position: r.position,
      impressions: r.impressions,
      clicks: r.clicks,
    }))
    .sort((a, b) => a.position - b.position);

  if (striking.length === 0) {
    logger.info("No striking distance keywords found.");
    return [];
  }

  const tableRows = striking.map((s) => [
    s.query.substring(0, 40),
    s.page.substring(0, 35),
    s.position.toFixed(1),
    String(s.impressions),
    String(s.clicks),
  ]);

  printTable(
    ["Query", "Page", "Pos", "Impr", "Clicks"],
    [42, 37, 7, 8, 8],
    tableRows
  );

  logger.info(`Striking distance keywords: ${striking.length}`);
  return striking;
}

async function reportCannibalization(
  logger: Logger,
  prefetched?: SearchAnalyticsRow[]
): Promise<Cannibalization[]> {
  const rows = prefetched ?? await searchAnalytics(
    await getAccessToken(SCOPES.readonly),
    ["query", "page"],
    1000
  );

  console.log("\n  KEYWORD CANNIBALIZATION — Multiple Pages for Same Query\n");

  // Group by query
  const queryMap = new Map<
    string,
    { url: string; clicks: number; impressions: number; position: number }[]
  >();

  for (const row of rows) {
    const k = row.keys ?? [];
    if (k.length < 2) continue;
    const query = k[0];
    const page = k[1].replace(CONFIG.siteUrl, "") || "/";

    if (!queryMap.has(query)) {
      queryMap.set(query, []);
    }
    queryMap.get(query)!.push({
      url: page,
      clicks: row.clicks,
      impressions: row.impressions,
      position: row.position,
    });
  }

  // Flag queries with 2+ pages
  const cannibalized: Cannibalization[] = [];
  for (const [query, pages] of queryMap) {
    if (pages.length >= 2) {
      cannibalized.push({
        query,
        pages: pages.sort((a, b) => a.position - b.position),
      });
    }
  }

  cannibalized.sort(
    (a, b) =>
      b.pages.reduce((s, p) => s + p.impressions, 0) -
      a.pages.reduce((s, p) => s + p.impressions, 0)
  );

  if (cannibalized.length === 0) {
    logger.info("No cannibalization detected.");
    return [];
  }

  for (const c of cannibalized.slice(0, 20)) {
    console.log(`  Query: "${c.query}" (${c.pages.length} pages competing)`);
    for (const page of c.pages) {
      console.log(
        `    ${page.url.padEnd(45)} pos ${page.position.toFixed(1).padEnd(6)} ${page.clicks} clicks, ${page.impressions} impr`
      );
    }
    console.log("");
  }

  logger.info(
    `Cannibalization detected: ${cannibalized.length} queries with competing pages`
  );
  return cannibalized;
}

async function reportErrors(logger: Logger): Promise<void> {
  const token = await getAccessToken(SCOPES.readonly);
  const rows = await searchAnalytics(token, ["page"], 50);

  console.log("\n  PAGES WITH ISSUES (Last 28 Days)\n");

  if (rows.length === 0) {
    logger.warn("No page data yet.");
    return;
  }

  const zeroCtr = rows.filter((r) => r.impressions > 0 && r.clicks === 0);
  const lowRanking = rows.filter((r) => r.position > 20);

  if (zeroCtr.length > 0) {
    console.log("  Pages with impressions but 0 clicks (fix titles/descriptions):");
    for (const row of zeroCtr) {
      const k = row.keys ?? [];
      if (k.length === 0) continue;
      const page = k[0].replace(CONFIG.siteUrl, "") || "/";
      console.log(
        `    ${page} — ${row.impressions} impressions, position ${row.position.toFixed(1)}`
      );
    }
    console.log("");
  }

  if (lowRanking.length > 0) {
    console.log("  Pages ranking below position 20 (need content improvement):");
    for (const row of lowRanking) {
      const k = row.keys ?? [];
      if (k.length === 0) continue;
      const page = k[0].replace(CONFIG.siteUrl, "") || "/";
      console.log(
        `    ${page} — position ${row.position.toFixed(1)}, ${row.impressions} impressions`
      );
    }
    console.log("");
  }

  if (zeroCtr.length === 0 && lowRanking.length === 0) {
    logger.info("No page issues detected.");
  } else {
    logger.warn(`Issues: ${zeroCtr.length} zero-click pages, ${lowRanking.length} low-ranking pages`);
  }
}

/**
 * ISO 8601 week-numbering year + week, e.g. "2026-W18".
 * Uses the standard algorithm: Thursday of the target week determines
 * which year the week belongs to, and week 1 is the week containing
 * the first Thursday. Crucially, late-Dec / early-Jan dates can sit in
 * a *different* year than their calendar year — e.g. 2027-01-01 is
 * 2026-W53 — which the previous home-rolled math got wrong.
 */
function getWeekLabel(): string {
  const d = new Date(Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  ));
  // Shift to nearest Thursday: ISO weeks belong to the year of their Thursday.
  const dayNum = d.getUTCDay() || 7; // Sun=0 → 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

interface TrendTotals {
  totalClicks: number;
  totalImpressions: number;
  avgPosition: number;
}

/**
 * Load the previous run's headline totals so we can show week-over-week deltas.
 * Uses getLatestLog + loadLog (the documented trend primitive). The file may be
 * either a WeeklySnapshot (top-level totals, written by saveWeeklySnapshot) or a
 * Logger log (totals live under `summary`, with avgPosition stored as a string).
 * Normalise both shapes; return null if nothing usable is found.
 */
function loadPreviousTotals(): TrendTotals | null {
  const latest = getLatestLog("gsc", "gsc-report");
  if (!latest) return null;
  const log = loadLog(latest);
  if (!log) return null;
  const summary = (log.summary as Record<string, unknown> | undefined) ?? log;
  const num = (v: unknown): number | null => {
    const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
    return Number.isFinite(n) ? n : null;
  };
  const totalClicks = num(summary.totalClicks);
  const totalImpressions = num(summary.totalImpressions);
  const avgPosition = num(summary.avgPosition);
  if (totalClicks === null || totalImpressions === null || avgPosition === null) {
    return null;
  }
  return { totalClicks, totalImpressions, avgPosition };
}

function fmtDelta(curr: number, prev: number, opts: { decimals?: number; invert?: boolean } = {}): string {
  const decimals = opts.decimals ?? 0;
  const diff = curr - prev;
  const sign = diff > 0 ? "+" : "";
  // For position, lower is better — flag direction accordingly.
  const arrow =
    diff === 0 ? "→" : opts.invert ? (diff < 0 ? "↑" : "↓") : diff > 0 ? "↑" : "↓";
  return `${sign}${diff.toFixed(decimals)} ${arrow}`;
}

function saveWeeklySnapshot(snapshot: WeeklySnapshot): void {
  const dir = path.join(CONFIG.logsDir, "gsc");
  fs.mkdirSync(dir, { recursive: true });
  const filename = `gsc-report-${snapshot.week}.json`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
  console.log(`\n  Weekly snapshot: ${path.relative(process.cwd(), filepath)}`);
}

async function fullReport(logger: Logger): Promise<void> {
  // Fetch page-level data once for both priority actions + top pages display.
  const token = await getAccessToken(SCOPES.readonly);
  const pageRows = await searchAnalytics(token, ["page"], 50);

  // PRIORITY ACTIONS lead — surfaces page-level lost-clicks before everything else.
  const priorityActions = buildPriorityActions(pageRows);
  printPriorityActions(priorityActions);
  console.log("\n  " + "=".repeat(70) + "\n");

  const topQueries = await reportQueries(logger);
  console.log("\n  " + "=".repeat(70) + "\n");
  const topPages = await reportPages(logger);
  console.log("\n  " + "=".repeat(70) + "\n");

  // Single [query, page] fetch shared across the next three sub-reports.
  // Previously each one re-queried Search Analytics with the same dimensions
  // (3× quota burn for identical data, plus latency).
  const queryPageRows = await searchAnalytics(token, ["query", "page"], 1000);

  const quickWins = await reportQuickWins(logger, queryPageRows);
  console.log("\n  " + "=".repeat(70) + "\n");
  const strikingDistance = await reportStriking(logger, queryPageRows);
  console.log("\n  " + "=".repeat(70) + "\n");
  const cannibalization = await reportCannibalization(logger, queryPageRows);
  console.log("\n  " + "=".repeat(70) + "\n");
  await reportErrors(logger);

  // Compute totals from top queries. CTR and position are impression-weighted
  // (not unweighted per-query means) so they reflect the actual blended
  // performance: avgCtr = totalClicks / totalImpressions, and avgPosition is
  // weighted by impressions. An unweighted mean over-counts low-traffic queries.
  const totalClicks = topQueries.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = topQueries.reduce((s, r) => s + r.impressions, 0);
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPosition =
    totalImpressions > 0
      ? topQueries.reduce((s, r) => s + r.position * r.impressions, 0) /
        totalImpressions
      : 0;

  // TREND — compare against the previous run's headline totals (additive only).
  const prevTotals = loadPreviousTotals();
  let trendMarkdownLine: string | null = null;
  if (prevTotals) {
    const clicksD = fmtDelta(totalClicks, prevTotals.totalClicks);
    const imprD = fmtDelta(totalImpressions, prevTotals.totalImpressions);
    const posD = fmtDelta(avgPosition, prevTotals.avgPosition, { decimals: 1, invert: true });
    console.log("\n  TREND vs last run:");
    console.log(`    Clicks:      ${prevTotals.totalClicks} → ${totalClicks} (${clicksD})`);
    console.log(`    Impressions: ${prevTotals.totalImpressions} → ${totalImpressions} (${imprD})`);
    console.log(`    Avg pos:     ${prevTotals.avgPosition.toFixed(1)} → ${avgPosition.toFixed(1)} (${posD})`);
    trendMarkdownLine = `**Trend vs last run:** clicks ${clicksD}, impressions ${imprD}, avg position ${posD} (prev: ${prevTotals.totalClicks} clicks · ${prevTotals.totalImpressions} impr · pos ${prevTotals.avgPosition.toFixed(1)})`;
  } else {
    console.log("\n  TREND vs last run: no prior run found (first report).");
  }

  const week = getWeekLabel();
  const snapshot: WeeklySnapshot = {
    week,
    date: new Date().toISOString(),
    totalClicks,
    totalImpressions,
    avgCtr,
    avgPosition,
    topQueries: topQueries.slice(0, 10),
    topPages: topPages.slice(0, 10),
    quickWins,
    strikingDistance,
    cannibalization,
  };

  saveWeeklySnapshot(snapshot);

  // Markdown report — durable, readable, version-controllable.
  const markdown = buildMarkdownReport(snapshot, priorityActions, pageRows, trendMarkdownLine);
  const mdPath = saveMarkdownReport(markdown);
  console.log(`  Markdown report: ${path.relative(process.cwd(), mdPath)}`);

  logger.save({
    command: "full",
    week,
    totalClicks,
    totalImpressions,
    avgCtr: avgCtr.toFixed(4),
    avgPosition: avgPosition.toFixed(1),
    quickWinsCount: quickWins.length,
    strikingCount: strikingDistance.length,
    cannibalizationCount: cannibalization.length,
    priorityActionsCount: priorityActions.length,
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "--help" || command === "-h") {
    console.log(HELP);
    return;
  }

  // DORMANT guard: no Google service-account credentials → no-op with a notice.
  if (!fs.existsSync(CONFIG.credentialsPath)) {
    console.log(
      `::notice:: [gsc-report] No Google service-account credentials at ${CONFIG.credentialsPath}. Skipping — dormant until GSC access is configured.`,
    );
    return;
  }

  const logger = new Logger("gsc", "gsc-report");

  console.log("\n  alioahmed — GSC Analytics Report");
  console.log("  =====================================\n");

  switch (command) {
    case "queries":
      await reportQueries(logger);
      logger.save({ command: "queries" });
      break;

    case "pages":
      await reportPages(logger);
      logger.save({ command: "pages" });
      break;

    case "quick-wins":
      await reportQuickWins(logger);
      logger.save({ command: "quick-wins" });
      break;

    case "striking":
      await reportStriking(logger);
      logger.save({ command: "striking" });
      break;

    case "cannibalization":
      await reportCannibalization(logger);
      logger.save({ command: "cannibalization" });
      break;

    case "errors":
      await reportErrors(logger);
      logger.save({ command: "errors" });
      break;

    default:
      await fullReport(logger);
      break;
  }
}

main().catch((err) => {
  console.error(`\n  Fatal error: ${err.message}`);
  process.exit(1);
});
