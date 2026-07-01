/**
 * IndexNow Submission — alioahmed (Streaming, Multi-Engine)
 *
 * Submits one URL at a time to ALL 6 IndexNow endpoints in parallel:
 *   - api.indexnow.org (shared, reaches all engines)
 *   - www.bing.com/indexnow (direct Bing)
 *   - yandex.com/indexnow (direct Yandex)
 *   - searchadvisor.naver.com/indexnow (direct Naver)
 *   - search.seznam.cz/indexnow (direct Seznam)
 *   - indexnow.yep.com/indexnow (direct Yep)
 *
 * STREAMING vs BATCH
 *   Streaming (default): one URL per request, small delay between URLs.
 *   Bing Webmaster Tools flags batch mode as a quality issue — it can
 *   overload origin servers and delays indexing. This script defaults to
 *   streaming. Use --batch only for one-off historical backfills.
 *
 * DORMANT until an IndexNow key exists (env INDEXNOW_KEY or public/<key>.txt).
 * Without one it no-ops with a clear notice.
 *
 * USAGE:
 *   npx tsx scripts/indexnow-submit.ts                Stream all sitemap pages
 *   npx tsx scripts/indexnow-submit.ts --static       Stream static pages only
 *   npx tsx scripts/indexnow-submit.ts --batch        Use legacy batch POST
 *   npx tsx scripts/indexnow-submit.ts --delay 500    Custom delay ms between URLs (default 250)
 *   npx tsx scripts/indexnow-submit.ts --help         Show this help
 */

import { CONFIG, STATIC_PAGES, getFullUrl } from "./lib/config";
import { parseSitemap } from "./lib/sitemap-parser";
import { INDEXNOW_ENDPOINTS, submitToAllEndpoints } from "./lib/indexnow";
import { Logger } from "./lib/logger";

const HELP = `
  alioahmed — IndexNow Submission (Streaming)

  Commands:
    npx tsx scripts/indexnow-submit.ts             Stream every page in the sitemap
    npx tsx scripts/indexnow-submit.ts --static     Stream static pages only (${STATIC_PAGES.length})
    npx tsx scripts/indexnow-submit.ts --batch      Legacy batch POST (NOT recommended by Bing)
    npx tsx scripts/indexnow-submit.ts --delay 500  Override per-URL delay in ms (default 250)
    npx tsx scripts/indexnow-submit.ts --help       Show this help
`;

async function getUrls(mode: "all" | "static"): Promise<string[]> {
  switch (mode) {
    case "static":
      return STATIC_PAGES.map(getFullUrl);
    case "all":
    default:
      return parseSitemap();
  }
}

// Endpoint list + per-endpoint submit live in ./lib/indexnow (shared with
// indexnow-on-change.ts so the two can't drift). Streaming = one URL per batch.
async function submitOneUrlToAllEngines(url: string) {
  return submitToAllEndpoints([url], { timeout: 15000, maxRetries: 1 });
}

async function submitBatch(urls: string[], logger: Logger): Promise<number> {
  logger.warn("BATCH MODE — Bing recommends streaming; use sparingly.");
  const results = await submitToAllEndpoints(urls, { timeout: 30000, maxRetries: 2 });

  console.log("\n  ────────────────────────────────────");
  console.log("  SUMMARY (BATCH)");
  console.log("  ────────────────────────────────────");
  let total = 0;
  for (const r of results) {
    const accepted = r.ok ? urls.length : 0;
    console.log(
      `  ${r.ok ? "OK  " : "FAIL"} ${r.name.padEnd(25)} ${accepted}/${urls.length} (${r.status})`
    );
    total += accepted;
  }
  console.log(`\n  Total accepted: ${total}\n`);

  logger.save({ mode: "batch", urlCount: urls.length, totalAccepted: total });
  return total;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function streamAll(urls: string[], delayMs: number, logger: Logger): Promise<number> {
  console.log(`  Streaming ${urls.length} URLs → ${INDEXNOW_ENDPOINTS.length} engines (delay ${delayMs}ms between URLs)\n`);

  const perEngine: Record<string, { ok: number; fail: number }> = {};
  for (const e of INDEXNOW_ENDPOINTS) perEngine[e.name] = { ok: 0, fail: 0 };

  let processed = 0;
  let totalOk = 0;
  for (const url of urls) {
    const results = await submitOneUrlToAllEngines(url);
    const okCount = results.filter((r) => r.ok).length;
    totalOk += okCount;
    const path = url.replace(CONFIG.siteUrl, "");
    console.log(`  ${okCount === INDEXNOW_ENDPOINTS.length ? "OK  " : okCount > 0 ? "WARN" : "FAIL"} ${path}  [${okCount}/${INDEXNOW_ENDPOINTS.length}]`);
    for (const r of results) {
      if (r.ok) perEngine[r.name].ok++;
      else perEngine[r.name].fail++;
    }
    processed++;
    if (processed < urls.length) await sleep(delayMs);
  }

  console.log("\n  ────────────────────────────────────");
  console.log("  SUMMARY (STREAMING)");
  console.log("  ────────────────────────────────────");
  console.log(`  URLs processed: ${processed}`);
  for (const [name, { ok, fail }] of Object.entries(perEngine)) {
    console.log(`  ${ok === processed ? "OK  " : fail === processed ? "FAIL" : "WARN"} ${name.padEnd(25)} ${ok}/${processed}`);
  }
  console.log();

  logger.save({
    mode: "stream",
    urlCount: processed,
    delayMs,
    engines: perEngine,
  });

  return totalOk;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(HELP);
    return;
  }

  // DORMANT guard: no IndexNow key → no-op with a clear notice (never crash).
  if (!CONFIG.indexNowKey) {
    console.log(
      "::notice:: [indexnow-submit] No IndexNow key (set INDEXNOW_KEY or add public/<key>.txt). Skipping — dormant until deploy.",
    );
    return;
  }

  let mode: "all" | "static" = "all";
  if (args.includes("--static")) mode = "static";

  const useBatch = args.includes("--batch");
  const delayIdx = args.indexOf("--delay");
  let delayMs = 250;
  if (delayIdx !== -1 && args[delayIdx + 1]) {
    const d = parseInt(args[delayIdx + 1], 10);
    delayMs = Number.isFinite(d) ? d : 250;
  }

  const logger = new Logger("indexnow", "indexnow-submit");

  console.log("\n  alioahmed — IndexNow Submission");
  console.log("  ====================================\n");
  logger.info(`Mode: ${mode} | strategy: ${useBatch ? "batch" : "stream"}`);

  const urls = await getUrls(mode);
  logger.info(`Found ${urls.length} URLs to submit`);

  if (urls.length === 0) {
    logger.warn("No URLs found. Nothing to submit.");
    logger.save({ mode, urlCount: 0, submitted: 0 });
    return;
  }

  const totalAccepted = useBatch
    ? await submitBatch(urls, logger)
    : await streamAll(urls, Math.max(50, delayMs), logger);

  // Attempted >0 URLs but nothing was accepted by any engine → fail the run so
  // the deploy pipeline surfaces a connectivity / IndexNow-key problem. (The
  // empty-list case returned exit 0 earlier.)
  if (totalAccepted === 0) {
    console.error("\n  Every endpoint rejected all URLs. Check connectivity / IndexNow key.\n");
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(`\n  Fatal error: ${err.message}`);
  process.exit(1);
});
