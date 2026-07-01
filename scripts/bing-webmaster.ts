/**
 * Bing Webmaster API — alioahmed
 *
 * Submit URLs directly to Bing, check indexing status, and pull crawl stats.
 * Goes BEYOND IndexNow — uses Bing's own Webmaster API for:
 *   - Direct URL submission (quota: 10,000/day)
 *   - URL indexing status check
 *   - Crawl stats (requests, errors, pages crawled)
 *   - URL info (HTTP status, last crawl date)
 *
 * SETUP:
 *   1. Go to https://www.bing.com/webmasters
 *   2. Settings → API Access → Generate API Key
 *   3. Set environment variable: BING_API_KEY=your-key
 *   OR save to: credentials/bing-api-key.txt
 *
 * USAGE:
 *   npx tsx scripts/bing-webmaster.ts submit          — Submit all URLs to Bing
 *   npx tsx scripts/bing-webmaster.ts status <url>     — Check indexing status of a URL
 *   npx tsx scripts/bing-webmaster.ts crawl-stats      — Get crawl statistics
 *   npx tsx scripts/bing-webmaster.ts url-info <url>   — Get crawl info for specific URL
 *   npx tsx scripts/bing-webmaster.ts submit-sitemap   — Submit sitemap to Bing
 *   npx tsx scripts/bing-webmaster.ts --help           — Show this help
 */

import * as fs from "fs";
import * as path from "path";
import { CONFIG, STATIC_PAGES, getFullUrl } from "./lib/config";
import { parseSitemap } from "./lib/sitemap-parser";
import { fetchWithRetry } from "./lib/fetcher";
import { Logger } from "./lib/logger";
import { checkQuota, recordQuota, getQuotaRemaining } from "./lib/quota";

const BING_API_HOST = "https://ssl.bing.com/webmaster/api.svc/json";

// Bing's URL submission quota varies by account (10/day for new accounts,
// up to 10,000/day for verified ones). We track locally with a conservative
// 100/day floor so a misconfigured run can't burn the whole day's budget.
// Run `bing-webmaster.ts quota` to see the live cap from Bing.
const BING_DAILY_LIMIT = 100;
const QUOTA_NAME = "bing-submit";

const HELP = `
  alioahmed — Bing Webmaster API

  Commands:
    submit              Submit all URLs to Bing for indexing
    submit --static     Submit only ${STATIC_PAGES.length} static pages
    status <url>        Check indexing status of a specific URL
    crawl-stats         Get crawl statistics (requests, errors, pages)
    url-info <url>      Get crawl info (HTTP status, last crawl date)
    submit-sitemap      Submit sitemap URL to Bing
    quota               Check remaining daily URL submission quota
    issues              List crawl issues Bing found
    fetch <url>         Trigger Bing to re-crawl a specific URL
    --help              Show this help

  Authentication:
    Set BING_API_KEY environment variable
    OR save key to: credentials/bing-api-key.txt

  Get your API key:
    https://www.bing.com/webmasters → Settings → API Access → API Key
`;

function getBingApiKey(): string {
  const envKey = process.env.BING_API_KEY;
  if (envKey && envKey.trim().length > 0) return envKey.trim();

  const keyFile = path.join(path.dirname(CONFIG.credentialsPath), "bing-api-key.txt");
  if (fs.existsSync(keyFile)) {
    const key = fs.readFileSync(keyFile, "utf-8").trim();
    if (key.length > 0) return key;
  }

  console.error("\n  Bing API key not found.\n");
  console.error("  Option 1: Set environment variable");
  console.error("    BING_API_KEY=your-key npx tsx scripts/bing-webmaster.ts submit\n");
  console.error("  Option 2: Save to file");
  console.error("    echo 'your-key' > credentials/bing-api-key.txt\n");
  console.error("  Get your key at: https://www.bing.com/webmasters → Settings → API Access");
  process.exit(1);
}

async function submitUrls(logger: Logger, staticOnly: boolean): Promise<void> {
  const apiKey = getBingApiKey();
  const siteUrl = CONFIG.siteUrl;

  let urls: string[];
  if (staticOnly) {
    urls = STATIC_PAGES.map(getFullUrl);
  } else {
    try {
      urls = await parseSitemap();
    } catch {
      logger.warn("Sitemap fetch failed, falling back to static pages...");
      urls = STATIC_PAGES.map(getFullUrl);
    }
  }

  const remaining = getQuotaRemaining(QUOTA_NAME, BING_DAILY_LIMIT);
  if (remaining === 0) {
    logger.warn(`Daily Bing submission quota exhausted (${BING_DAILY_LIMIT}/day). Resets at UTC midnight.`);
    logger.save({ action: "submit", submitted: 0, failed: 0, total: urls.length, quotaExhausted: true });
    return;
  }
  if (urls.length > remaining) {
    logger.warn(`Quota cap: ${urls.length} pending but only ${remaining} submissions left today. Trimming to ${remaining}.`);
    urls = urls.slice(0, remaining);
  }

  logger.info(`Submitting ${urls.length} URLs to Bing Webmaster API (${remaining}/${BING_DAILY_LIMIT} quota left)...`);

  const batchSize = 500;
  let submitted = 0;
  let failed = 0;

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);

    try {
      const res = await fetchWithRetry(
        `${BING_API_HOST}/SubmitUrlBatch?apikey=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ siteUrl, urlList: batch }),
        },
        { timeout: 30000, maxRetries: 2 }
      );

      // A 200 can still carry a JSON error envelope. Bing returns `{ "d": ... }`
      // on success and an error object otherwise — so parse the body and only
      // count a batch as submitted (and only then record quota) when there's no
      // error field. A non-2xx, an error envelope, or unparseable body = failure.
      const bodyText = await res.text().catch(() => "");
      let parsed: any = undefined;
      let parseFailed = false;
      if (bodyText) {
        try {
          parsed = JSON.parse(bodyText);
        } catch {
          parseFailed = true;
        }
      }
      const hasError =
        parsed != null && typeof parsed === "object" &&
        (parsed.ErrorCode != null || parsed.Errors != null || parsed.Message != null || parsed.error != null);
      const succeeded = res.ok && !parseFailed && !hasError;

      if (succeeded) {
        logger.success(`Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} URLs submitted`);
        submitted += batch.length;
        recordQuota(QUOTA_NAME, batch.length);
      } else {
        logger.error(`Batch ${Math.floor(i / batchSize) + 1}: Failed (${res.status}) ${bodyText.substring(0, 200)}`);
        failed += batch.length;
      }
    } catch (err) {
      logger.error(`Batch ${Math.floor(i / batchSize) + 1}: Error — ${(err as Error).message}`);
      failed += batch.length;
    }
  }

  console.log("\n  ────────────────────────────────────");
  console.log("  BING SUBMISSION SUMMARY");
  console.log("  ────────────────────────────────────");
  console.log(`  Submitted: ${submitted}`);
  console.log(`  Failed:    ${failed}`);
  console.log(`  Total:     ${urls.length}`);

  logger.save({ action: "submit", submitted, failed, total: urls.length });

  // Had URLs to submit but none landed → signal failure to the deploy pipeline.
  if (submitted === 0 && urls.length > 0) {
    process.exitCode = 1;
  }
}

async function checkUrlStatus(url: string, logger: Logger): Promise<void> {
  const apiKey = getBingApiKey();

  logger.info(`Checking URL status: ${url}`);

  try {
    const encodedUrl = encodeURIComponent(url);
    const res = await fetchWithRetry(
      `${BING_API_HOST}/GetUrlInfo?siteUrl=${encodeURIComponent(CONFIG.siteUrl)}&url=${encodedUrl}&apikey=${apiKey}`,
      { method: "GET" },
      { timeout: 15000 }
    );

    if (res.ok) {
      const data = await res.json();
      console.log("\n  URL Info:");
      console.log(`  URL:          ${url}`);
      console.log(`  HTTP Status:  ${data.HttpStatusCode || "unknown"}`);
      console.log(`  Last Crawled: ${data.LastCrawledDate || "never"}`);
      console.log(`  Discovered:   ${data.DiscoveredDate || "unknown"}`);
      console.log(`  In Index:     ${data.IsInIndex !== undefined ? data.IsInIndex : "unknown"}`);
      logger.save({ action: "url-info", url, data });
    } else {
      const text = await res.text().catch(() => "");
      logger.error(`Failed to get URL info: ${res.status} ${text.substring(0, 200)}`);
    }
  } catch (err) {
    logger.error(`Error: ${(err as Error).message}`);
  }
}

async function getCrawlStats(logger: Logger): Promise<void> {
  const apiKey = getBingApiKey();
  const siteUrl = encodeURIComponent(CONFIG.siteUrl);

  logger.info("Fetching Bing crawl statistics...");

  try {
    const res = await fetchWithRetry(
      `${BING_API_HOST}/GetCrawlStats?siteUrl=${siteUrl}&apikey=${apiKey}`,
      { method: "GET" },
      { timeout: 15000 }
    );

    if (res.ok) {
      const data = await res.json();

      console.log("\n  BING CRAWL STATISTICS");
      console.log("  ────────────────────────────────────\n");

      if (Array.isArray(data.d)) {
        console.log(`  ${"Date".padEnd(15)} ${"Pages".padEnd(10)} ${"Errors".padEnd(10)} ${"Blocked".padEnd(10)} ${"Other"}`);
        console.log(`  ${"-".repeat(55)}`);

        for (const entry of data.d.slice(-14)) {
          const date = entry.Date ? new Date(parseInt(entry.Date.match(/\d+/)?.[0] || "0")).toLocaleDateString() : "?";
          console.log(`  ${date.padEnd(15)} ${String(entry.CrawledPages || 0).padEnd(10)} ${String(entry.CrawlErrors || 0).padEnd(10)} ${String(entry.BlockedByRobotsTxt || 0).padEnd(10)} ${entry.OtherCodes || 0}`);
        }
      } else {
        console.log("  Raw response:");
        console.log(`  ${JSON.stringify(data).substring(0, 500)}`);
      }

      logger.save({ action: "crawl-stats", data });
    } else {
      const text = await res.text().catch(() => "");
      logger.error(`Failed: ${res.status} ${text.substring(0, 200)}`);
    }
  } catch (err) {
    logger.error(`Error: ${(err as Error).message}`);
  }
}

async function submitSitemap(logger: Logger): Promise<void> {
  const apiKey = getBingApiKey();
  const siteUrl = CONFIG.siteUrl;
  const sitemapUrl = `${siteUrl}/sitemap.xml`;

  logger.info(`Submitting sitemap to Bing: ${sitemapUrl}`);

  try {
    const res = await fetchWithRetry(
      `${BING_API_HOST}/SubmitFeed?apikey=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl, feedUrl: sitemapUrl }),
      },
      { timeout: 15000 }
    );

    if (res.ok || res.status === 200) {
      logger.success(`Sitemap submitted: ${sitemapUrl}`);
    } else {
      const text = await res.text().catch(() => "");
      logger.error(`Sitemap submission failed: ${res.status} ${text.substring(0, 200)}`);
    }
  } catch (err) {
    logger.error(`Error: ${(err as Error).message}`);
  }

  logger.save({ action: "submit-sitemap", sitemapUrl });
}

async function getQuota(logger: Logger): Promise<void> {
  const apiKey = getBingApiKey();
  const siteUrl = encodeURIComponent(CONFIG.siteUrl);

  logger.info("Checking daily URL submission quota...");

  try {
    const res = await fetchWithRetry(
      `${BING_API_HOST}/GetUrlSubmissionQuota?siteUrl=${siteUrl}&apikey=${apiKey}`,
      { method: "GET" },
      { timeout: 15000 }
    );

    if (res.ok) {
      const data = await res.json();
      console.log("\n  BING URL SUBMISSION QUOTA");
      console.log("  ────────────────────────────────────");
      console.log(`  Daily quota:  ${data.d?.DailyQuota ?? data.DailyQuota ?? "unknown"}`);
      console.log(`  Monthly quota: ${data.d?.MonthlyQuota ?? data.MonthlyQuota ?? "unknown"}`);
      logger.save({ action: "quota", data });
    } else {
      const text = await res.text().catch(() => "");
      logger.error(`Failed: ${res.status} ${text.substring(0, 200)}`);
    }
  } catch (err) {
    logger.error(`Error: ${(err as Error).message}`);
  }
}

async function getCrawlIssues(logger: Logger): Promise<void> {
  const apiKey = getBingApiKey();
  const siteUrl = encodeURIComponent(CONFIG.siteUrl);

  logger.info("Fetching Bing crawl issues...");

  try {
    const res = await fetchWithRetry(
      `${BING_API_HOST}/GetCrawlIssues?siteUrl=${siteUrl}&apikey=${apiKey}`,
      { method: "GET" },
      { timeout: 15000 }
    );

    if (res.ok) {
      const data = await res.json();
      const issues = data.d || data || [];

      console.log("\n  BING CRAWL ISSUES");
      console.log("  ────────────────────────────────────\n");

      if (Array.isArray(issues) && issues.length > 0) {
        for (const issue of issues) {
          console.log(`  Issue: ${issue.Issue || issue.Message || JSON.stringify(issue).substring(0, 100)}`);
          if (issue.Severity) console.log(`  Severity: ${issue.Severity}`);
          if (issue.Count) console.log(`  Count: ${issue.Count}`);
          console.log("");
        }
      } else {
        console.log("  No crawl issues found.");
      }

      logger.save({ action: "issues", data });
    } else {
      const text = await res.text().catch(() => "");
      logger.error(`Failed: ${res.status} ${text.substring(0, 200)}`);
    }
  } catch (err) {
    logger.error(`Error: ${(err as Error).message}`);
  }
}

async function fetchUrl(url: string, logger: Logger): Promise<void> {
  if (!checkQuota(QUOTA_NAME, BING_DAILY_LIMIT, 1)) {
    logger.warn(`Daily Bing submission quota exhausted (${BING_DAILY_LIMIT}/day). Resets at UTC midnight.`);
    logger.save({ action: "fetch", url, quotaExhausted: true });
    return;
  }

  const apiKey = getBingApiKey();
  const siteUrl = CONFIG.siteUrl;

  logger.info(`Requesting Bing to re-crawl: ${url}`);

  try {
    const res = await fetchWithRetry(
      `${BING_API_HOST}/SubmitUrl?apikey=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl, url }),
      },
      { timeout: 15000 }
    );

    if (res.ok || res.status === 200) {
      logger.success(`URL submitted for re-crawl: ${url}`);
      recordQuota(QUOTA_NAME, 1);
    } else {
      const text = await res.text().catch(() => "");
      logger.error(`Failed: ${res.status} ${text.substring(0, 200)}`);
    }
  } catch (err) {
    logger.error(`Error: ${(err as Error).message}`);
  }

  logger.save({ action: "fetch", url });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "--help" || command === "-h" || !command) {
    console.log(HELP);
    return;
  }

  // DORMANT guard: no Bing API key (env or credentials/bing-api-key.txt) → no-op.
  const bingKeyFile = path.join(path.dirname(CONFIG.credentialsPath), "bing-api-key.txt");
  if (!CONFIG.bingApiKey && !process.env.BING_API_KEY && !fs.existsSync(bingKeyFile)) {
    console.log(
      "::notice:: [bing-webmaster] No BING_API_KEY (env or credentials/bing-api-key.txt). Skipping — dormant until a Bing key is configured.",
    );
    return;
  }

  const logger = new Logger("bing", "bing-webmaster");

  console.log("\n  alioahmed — Bing Webmaster API");
  console.log("  ====================================\n");

  switch (command) {
    case "submit": {
      const staticOnly = args.includes("--static");
      await submitUrls(logger, staticOnly);
      break;
    }

    case "status":
    case "url-info": {
      const url = args[1] || `${CONFIG.siteUrl}/`;
      await checkUrlStatus(url, logger);
      break;
    }

    case "crawl-stats":
      await getCrawlStats(logger);
      break;

    case "submit-sitemap":
      await submitSitemap(logger);
      break;

    case "quota":
      await getQuota(logger);
      break;

    case "issues":
      await getCrawlIssues(logger);
      break;

    case "fetch": {
      const fetchTarget = args[1] || `${CONFIG.siteUrl}/`;
      await fetchUrl(fetchTarget, logger);
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
