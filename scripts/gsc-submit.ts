/**
 * Google Search Console Submission — alioahmed
 *
 * Smart inspection with skip-indexed logic from previous runs.
 *
 * USAGE:
 *   npx tsx scripts/gsc-submit.ts sitemaps           — Resubmit sitemap to GSC
 *   npx tsx scripts/gsc-submit.ts inspect             — Smart inspect (skip indexed from last run)
 *   npx tsx scripts/gsc-submit.ts inspect --force     — Inspect all pages (ignore last run)
 *   npx tsx scripts/gsc-submit.ts inspect-all         — Inspect the full sitemap
 *   npx tsx scripts/gsc-submit.ts status              — Show sitemap status
 *   npx tsx scripts/gsc-submit.ts full                — Sitemaps + smart inspect
 *   npx tsx scripts/gsc-submit.ts --help              — Show this help
 */

import * as fs from "fs";
import * as path from "path";
import { CONFIG, getFullUrl } from "./lib/config";
import { getAuditPages } from "./lib/pages";
import { getAccessToken, SCOPES } from "./lib/auth";
import { fetchWithRetry } from "./lib/fetcher";
import { Logger, loadLog } from "./lib/logger";
import { recordQuota, getQuotaRemaining } from "./lib/quota";
import type { InspectionResult } from "./lib/types";

const QUOTA_NAME = "gsc-inspect";

const HELP = `
  alioahmed — Google Search Console Submission

  Commands:
    sitemaps           Resubmit sitemap to GSC
    inspect            Smart inspect (skip pages indexed in last run)
    inspect --force    Inspect all static pages (ignore last run)
    inspect-all        Inspect the full sitemap (every page)
    status             Show current sitemap status in GSC
    full               Sitemaps + smart inspect

  Examples:
    npx tsx scripts/gsc-submit.ts sitemaps
    npx tsx scripts/gsc-submit.ts inspect
    npx tsx scripts/gsc-submit.ts inspect --force
    npx tsx scripts/gsc-submit.ts full
`;

/**
 * Build a skip-set of URLs whose verdict was PASS in the most recent
 * gsc-submit log that actually contains inspection data. We filter to
 * inspection-shaped logs because `gsc-submit sitemaps` and `status`
 * runs also emit `gsc-submit-*.json` logs but contain zero PASS
 * verdicts — using one of those would silently disable smart-skip.
 */
function getSkipList(): Set<string> {
  const dir = path.join(CONFIG.logsDir, "gsc");
  if (!fs.existsSync(dir)) return new Set();

  const candidates = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("gsc-submit-") && f.endsWith(".json"))
    .sort()
    .reverse();

  for (const file of candidates) {
    const logData = loadLog(path.join(dir, file));
    if (!logData || !logData.entries) continue;

    const entries = logData.entries as Array<{
      level: string;
      message: string;
      data?: { url?: string; verdict?: string };
    }>;

    const passedUrls = new Set<string>();
    for (const entry of entries) {
      if (entry.data && entry.data.verdict === "PASS" && entry.data.url) {
        passedUrls.add(entry.data.url);
      }
    }

    if (passedUrls.size > 0) return passedUrls;
  }

  return new Set();
}

async function submitSitemaps(logger: Logger): Promise<boolean> {
  const token = await getAccessToken(SCOPES.webmasters);
  const sitemapUrl = `${CONFIG.siteUrl}/sitemap.xml`;
  const encodedSitemap = encodeURIComponent(sitemapUrl);
  const url = `${CONFIG.gscBaseUrl}/sites/${encodeURIComponent(CONFIG.gscSite)}/sitemaps/${encodedSitemap}`;

  logger.info("Submitting sitemap to Google Search Console...");

  const res = await fetchWithRetry(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  // res.ok covers any 2xx; the Sitemaps API returns 200 or 204 on success.
  if (res.ok) {
    logger.success(`Sitemap submitted: ${sitemapUrl} (${res.status})`);
    return true;
  }
  logger.error(`Sitemap submission failed: ${sitemapUrl} (${res.status})`);
  return false;
}

async function getSitemapStatus(logger: Logger): Promise<void> {
  const token = await getAccessToken(SCOPES.webmasters);
  const url = `${CONFIG.gscBaseUrl}/sites/${encodeURIComponent(CONFIG.gscSite)}/sitemaps`;

  logger.info("Fetching sitemap status...");

  const res = await fetchWithRetry(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    logger.error(`Failed to fetch sitemaps: ${res.status}`);
    return;
  }

  const data = await res.json();
  const sitemaps = data.sitemap || [];

  if (sitemaps.length === 0) {
    logger.warn("No sitemaps found. Run: npx tsx scripts/gsc-submit.ts sitemaps");
    return;
  }

  for (const sm of sitemaps) {
    const submitted = sm.lastSubmitted
      ? new Date(sm.lastSubmitted).toLocaleDateString()
      : "never";
    const downloaded = sm.lastDownloaded
      ? new Date(sm.lastDownloaded).toLocaleDateString()
      : "never";
    const errors = sm.errors || 0;
    const warnings = sm.warnings || 0;

    logger.info(`${sm.path}`);
    logger.info(`  Submitted: ${submitted} | Downloaded: ${downloaded} | Errors: ${errors} | Warnings: ${warnings}`);
  }
}

async function inspectUrls(
  pages: string[],
  logger: Logger,
  options: { smart: boolean }
): Promise<void> {
  const token = await getAccessToken(SCOPES.webmasters);

  let pagesToInspect = pages;

  if (options.smart) {
    const skipList = getSkipList();
    if (skipList.size > 0) {
      const filtered = pages.filter((p) => !skipList.has(getFullUrl(p)));
      logger.info(`Smart mode: Skipping ${pages.length - filtered.length} already indexed pages from last run`);
      pagesToInspect = filtered;
    } else {
      logger.info("Smart mode: No previous run found, inspecting all pages");
    }
  }

  if (pagesToInspect.length === 0) {
    logger.success("All pages were indexed in the last run. Nothing to inspect.");
    return;
  }

  const quotaRemaining = getQuotaRemaining(QUOTA_NAME, CONFIG.gscInspectionDailyLimit);
  if (quotaRemaining === 0) {
    logger.warn(
      `Daily inspection quota exhausted (${CONFIG.gscInspectionDailyLimit}/day). Resets at UTC midnight.`
    );
    logger.save({ totalInspected: 0, indexed: 0, notIndexed: 0, errors: 0, smart: options.smart, quotaExhausted: true });
    return;
  }

  if (pagesToInspect.length > quotaRemaining) {
    logger.warn(
      `Quota cap: ${pagesToInspect.length} pending but only ${quotaRemaining} inspections left today. Will stop at limit.`
    );
    pagesToInspect = pagesToInspect.slice(0, quotaRemaining);
  }

  logger.info(`Inspecting ${pagesToInspect.length} URLs (${quotaRemaining}/${CONFIG.gscInspectionDailyLimit} quota left)...`);

  const results: InspectionResult[] = [];
  const indexed: string[] = [];
  const notIndexed: string[] = [];
  const errors: string[] = [];

  for (const page of pagesToInspect) {
    const fullUrl = getFullUrl(page);

    try {
      const res = await fetchWithRetry(
        CONFIG.gscInspectUrl,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inspectionUrl: fullUrl,
            siteUrl: CONFIG.gscSite,
          }),
        },
        { rateLimit: 50 }
      );
      // Debit quota only once a Response is in hand — a network throw before
      // this point never reached Google, so it must not consume the ledger.
      recordQuota(QUOTA_NAME);

      if (!res.ok) {
        if (res.status === 429) {
          logger.warn("Rate limited — stopping. (Quota: 2000/day)");
          break;
        }
        errors.push(page);
        logger.error(`${page} — HTTP ${res.status}`);
        results.push({
          url: fullUrl,
          verdict: "UNKNOWN",
          coverageState: `HTTP ${res.status}`,
          lastCrawlTime: null,
          inspectedAt: new Date().toISOString(),
        });
        continue;
      }

      const data = await res.json();
      const result = data.inspectionResult?.indexStatusResult;

      if (!result) {
        errors.push(page);
        logger.warn(`${page} — No inspection result returned`);
        results.push({
          url: fullUrl,
          verdict: "UNKNOWN",
          coverageState: "No result",
          lastCrawlTime: null,
          inspectedAt: new Date().toISOString(),
        });
        continue;
      }

      const verdict = result.verdict as InspectionResult["verdict"];
      const coverageState = result.coverageState || "";
      const lastCrawl = result.lastCrawlTime || null;
      const lastCrawlDisplay = lastCrawl
        ? new Date(lastCrawl).toLocaleDateString()
        : "never";

      const inspectionResult: InspectionResult = {
        url: fullUrl,
        verdict,
        coverageState,
        lastCrawlTime: lastCrawl,
        inspectedAt: new Date().toISOString(),
      };

      results.push(inspectionResult);

      if (verdict === "PASS") {
        indexed.push(page);
        logger.success(`${page} — Indexed | Last crawl: ${lastCrawlDisplay}`, inspectionResult);
      } else if (verdict === "NEUTRAL" || verdict === "PARTIAL") {
        notIndexed.push(page);
        logger.warn(`${page} — ${coverageState || verdict} | Last crawl: ${lastCrawlDisplay}`, inspectionResult);
      } else {
        notIndexed.push(page);
        logger.error(`${page} — ${coverageState || verdict} | Last crawl: ${lastCrawlDisplay}`, inspectionResult);
      }
    } catch (err) {
      errors.push(page);
      logger.error(`${page} — Network error: ${(err as Error).message}`);
      results.push({
        url: fullUrl,
        verdict: "UNKNOWN",
        coverageState: "Network error",
        lastCrawlTime: null,
        inspectedAt: new Date().toISOString(),
      });
    }
  }

  console.log("\n  ────────────────────────────────────");
  console.log("  INSPECTION SUMMARY");
  console.log("  ────────────────────────────────────");
  console.log(`  Inspected:   ${pagesToInspect.length}`);
  console.log(`  Indexed:     ${indexed.length}`);
  console.log(`  Not indexed: ${notIndexed.length}`);
  if (errors.length > 0) {
    console.log(`  Errors:      ${errors.length}`);
  }

  if (notIndexed.length > 0) {
    console.log("\n  Pages needing attention:");
    for (const page of notIndexed) {
      console.log(`    ${getFullUrl(page)}`);
    }
  }

  if (indexed.length === pagesToInspect.length && errors.length === 0) {
    console.log("\n  All inspected pages are indexed.");
  }

  logger.save({
    totalInspected: pagesToInspect.length,
    indexed: indexed.length,
    notIndexed: notIndexed.length,
    errors: errors.length,
    smart: options.smart,
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    console.log(HELP);
    return;
  }

  // DORMANT guard: no Google service-account credentials → no-op with a notice.
  if (!fs.existsSync(CONFIG.credentialsPath)) {
    console.log(
      `::notice:: [gsc-submit] No Google service-account credentials at ${CONFIG.credentialsPath}. Skipping — dormant until GSC access is configured.`,
    );
    return;
  }

  const logger = new Logger("gsc", "gsc-submit");

  console.log("\n  alioahmed — GSC Submission");
  console.log("  ===============================\n");

  switch (command) {
    case "sitemaps": {
      const ok = await submitSitemaps(logger);
      logger.save({ command: "sitemaps", sitemapSubmitted: ok });
      if (!ok) process.exit(1);
      break;
    }

    case "status":
      await getSitemapStatus(logger);
      logger.save({ command: "status" });
      break;

    case "inspect": {
      const force = args.includes("--force");
      const smart = !force;
      // Sitemap = source of truth (the full sitemap), not a static subset.
      // Smart-skip + the daily quota guard keep this within GSC's 2000/day cap.
      await inspectUrls(await getAuditPages(), logger, { smart });
      break;
    }

    case "inspect-all":
      await inspectUrls(await getAuditPages(), logger, { smart: false });
      break;

    case "full": {
      const ok = await submitSitemaps(logger);
      console.log("\n  ────────────────────────────────────\n");
      await inspectUrls(await getAuditPages(), logger, { smart: true });
      if (!ok) process.exit(1);
      break;
    }

    default:
      console.log(`  Unknown command: ${command}`);
      console.log(HELP);
      break;
  }
}

main().catch((err) => {
  console.error(`\n  Fatal error: ${err.message}`);
  process.exit(1);
});
