/**
 * Schema & SEO Audit — alioahmed (personal profile)
 *
 * Full on-page SEO audit: meta tags (title/description length), single-H1,
 * OpenGraph, JSON-LD @type inventory, Core Web Vitals (keyless PageSpeed),
 * broken internal links, image alt text, canonical hygiene, noindex guard,
 * content freshness, and cross-page duplicate title/meta detection.
 *
 * Adapted from the commerce engine: product-schema / AggregateRating / WhatsApp
 * / banned-word checks are REMOVED (this is a person, not a store).
 *
 * USAGE:
 *   npx tsx scripts/schema-audit.ts               — Audit the static page set
 *   npx tsx scripts/schema-audit.ts --all         — Audit every page in the sitemap
 *   npx tsx scripts/schema-audit.ts --cwv         — Include Core Web Vitals
 *   npx tsx scripts/schema-audit.ts --links       — Check broken internal links
 *   npx tsx scripts/schema-audit.ts --full        — Everything (all pages + CWV + links)
 *   npx tsx scripts/schema-audit.ts /about        — Audit a single page
 *   npx tsx scripts/schema-audit.ts --help        — Show this help
 */

import { CONFIG, STATIC_PAGES, getFullUrl } from "./lib/config";
import { getAuditPages } from "./lib/pages";
import { fetchWithRetry } from "./lib/fetcher";
import { Logger } from "./lib/logger";
import type { AuditResult, CWVResult } from "./lib/types";

const HELP = `
  alioahmed — Schema & SEO Audit

  Commands:
    (no args)         Audit the static page set (${STATIC_PAGES.length})
    --all             Audit every page in the sitemap
    --cwv             Include Core Web Vitals (PageSpeed Insights, keyless OK)
    --links           Check for broken internal links
    --full            Everything: all pages + CWV + broken links
    /path             Audit a single page (e.g., /about)
`;

interface AuditOptions {
  checkCWV: boolean;
  checkLinks: boolean;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function extractSchemas(html: string): { types: string[]; raw: string[] } {
  const types: string[] = [];
  const raw: string[] = [];
  const ldMatches = html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs,
  );

  for (const m of ldMatches) {
    raw.push(m[1]);
    try {
      const data = JSON.parse(m[1]);
      if (data["@type"]) {
        types.push(Array.isArray(data["@type"]) ? data["@type"].join(", ") : data["@type"]);
      }
      if (data["@graph"]) {
        for (const item of data["@graph"]) {
          if (item["@type"]) {
            types.push(Array.isArray(item["@type"]) ? item["@type"].join(", ") : item["@type"]);
          }
        }
      }
    } catch {
      /* Malformed JSON-LD — check-jsonld-validity.ts surfaces these. */
    }
  }

  return { types, raw };
}

function extractInternalLinks(html: string): string[] {
  const links: string[] = [];
  const regex = /href="(\/[^"]*?)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1].split("#")[0].split("?")[0];
    if (href && !links.includes(href)) links.push(href);
  }
  return links;
}

function extractImagesWithoutAlt(html: string): string[] {
  const missing: string[] = [];
  const imgRegex = /<img\s[^>]*?>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const tag = match[0];
    if (/width="1"/.test(tag) && /height="1"/.test(tag)) continue; // tracking pixels
    const altMatch = tag.match(/alt="([^"]*)"/i);
    if (!altMatch || altMatch[1].trim() === "") {
      const srcMatch = tag.match(/src="([^"]*)"/i);
      missing.push(srcMatch ? srcMatch[1].substring(0, 80) : "(unknown src)");
    }
  }
  return missing;
}

function extractDateModified(html: string): string | null {
  const ldMatches = html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs,
  );
  for (const m of ldMatches) {
    try {
      const data = JSON.parse(m[1]);
      const items = data["@graph"] ? data["@graph"] : [data];
      for (const item of items) if (item.dateModified) return item.dateModified;
    } catch {
      /* skip */
    }
  }
  const metaMatch = html.match(/property="article:modified_time"\s+content="([^"]*)"/i);
  return metaMatch ? metaMatch[1] : null;
}

async function checkCoreWebVitals(url: string, logger: Logger): Promise<CWVResult | null> {
  try {
    // PSI works keyless at low volume; the key is optional (see config).
    let apiUrl = `${CONFIG.pageSpeedUrl}?url=${encodeURIComponent(url)}&strategy=mobile&category=performance`;
    if (CONFIG.pageSpeedApiKey) apiUrl += `&key=${CONFIG.pageSpeedApiKey}`;
    const res = await fetchWithRetry(apiUrl, undefined, { timeout: 60000, rateLimit: 60 });
    if (!res.ok) {
      logger.warn(`CWV unavailable for ${url}: HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    const audits = data.lighthouseResult?.audits;
    if (!audits) return null;
    const lcp = audits["largest-contentful-paint"]?.numericValue || 0;
    const cls = audits["cumulative-layout-shift"]?.numericValue || 0;
    const fcp = audits["first-contentful-paint"]?.numericValue || 0;
    const inp = audits["interaction-to-next-paint"]?.numericValue || 0;
    const performance = (data.lighthouseResult?.categories?.performance?.score || 0) * 100;
    let lcpStatus: CWVResult["lcpStatus"] = "good";
    if (lcp > 4000) lcpStatus = "poor";
    else if (lcp > 2500) lcpStatus = "needs-improvement";
    let inpStatus: CWVResult["inpStatus"] = "good";
    if (inp > 500) inpStatus = "poor";
    else if (inp > 200) inpStatus = "needs-improvement";
    return { lcp, cls, fcp, inp, performance, lcpStatus, inpStatus };
  } catch (err) {
    logger.warn(`CWV unavailable for ${url}: ${(err as Error).message}`);
    return null;
  }
}

async function checkBrokenLinks(internalLinks: string[], _logger: Logger): Promise<string[]> {
  const broken: string[] = [];
  for (const link of internalLinks) {
    try {
      const res = await fetchWithRetry(
        getFullUrl(link),
        { method: "HEAD" },
        { maxRetries: 1, timeout: 10000 },
      );
      if (res.status >= 400) broken.push(`${link} (${res.status})`);
    } catch {
      broken.push(`${link} (network error)`);
    }
  }
  return broken;
}

function emptyResult(url: string, status: number, issue: string): AuditResult {
  return {
    url,
    status,
    title: null,
    titleLength: 0,
    description: null,
    descriptionLength: 0,
    h1: null,
    h1Count: 0,
    ogTitle: false,
    ogDescription: false,
    ogImage: false,
    schemaTypes: [],
    brokenLinks: [],
    imagesWithoutAlt: [],
    cwv: null,
    dateModified: null,
    freshnessIssue: false,
    issues: [issue],
    severity: "critical",
  };
}

async function auditPage(
  pagePath: string,
  logger: Logger,
  options: AuditOptions,
): Promise<AuditResult> {
  const url = getFullUrl(pagePath);
  const issues: string[] = [];

  let html: string;
  let status: number;
  try {
    const res = await fetchWithRetry(url, { headers: { "User-Agent": "alioahmed-SEO-Audit/1.0" } });
    status = res.status;
    if (!res.ok) {
      logger.error(`${pagePath} — HTTP ${status}`);
      return emptyResult(url, status, `HTTP ${status}`);
    }
    html = await res.text();
  } catch (err) {
    logger.error(`${pagePath} — Network error: ${(err as Error).message}`);
    return emptyResult(url, 0, "Network error");
  }

  // Title — decode entities so &amp; / &#x27; don't inflate length.
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1]) : null;
  const titleLength = title ? title.length : 0;
  if (!title) {
    issues.push("Missing <title>");
  } else if (titleLength < 30) {
    issues.push(`Title too short (${titleLength} chars, min 30)`);
  } else if (titleLength > 60) {
    issues.push(`Title too long (${titleLength} chars, max 60 — hook truncates in SERP)`);
    if (title.includes("|")) {
      issues.push("Over-length title uses a pipe separator — drop the brand suffix / use a dash");
    }
  }
  // Duplicated name wastes premium SERP space.
  const nameRe = new RegExp(CONFIG.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  if (title && (title.match(nameRe) || []).length > 1) {
    issues.push(`Name "${CONFIG.name}" appears twice in title — drop the duplicate`);
  }
  // Keyword-stuffing guard — a 4+ letter content word repeated 3+ times.
  if (title) {
    const words = title.toLowerCase().match(/[a-z]{4,}/g) ?? [];
    const freq = new Map<string, number>();
    for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
    const stuffed = [...freq].filter(([, n]) => n >= 3).map(([w]) => w);
    if (stuffed.length > 0) {
      issues.push(`Possible keyword stuffing in title — "${stuffed.join('", "')}" repeated 3+ times`);
    }
  }

  // Meta description — 120-160 chars is the SERP sweet spot.
  const descMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/i);
  const description = descMatch ? decodeEntities(descMatch[1]) : null;
  const descriptionLength = description ? description.length : 0;
  if (!description) issues.push("Missing meta description");
  else if (descriptionLength > 160) issues.push(`Description too long (${descriptionLength} chars, max 160)`);
  else if (descriptionLength < 120) issues.push(`Description too short (${descriptionLength} chars, min 120)`);

  // H1 — exactly one.
  const h1Matches = html.match(/<h1[^>]*>.*?<\/h1>/gis);
  const h1Count = h1Matches ? h1Matches.length : 0;
  const h1Match = h1Matches ? h1Matches[0].replace(/<[^>]*>/g, "").trim() : null;
  if (h1Count === 0) issues.push("Missing H1 tag");
  else if (h1Count > 1) issues.push(`Multiple H1 tags found (${h1Count}) — should have exactly 1`);

  // OpenGraph.
  const ogTitle = html.includes('property="og:title"') || html.includes("property='og:title'");
  const ogDescription = html.includes('property="og:description"') || html.includes("property='og:description'");
  const ogImage = html.includes('property="og:image"') || html.includes("property='og:image'");
  if (!ogTitle) issues.push("Missing og:title");
  if (!ogDescription) issues.push("Missing og:description");
  if (!ogImage) issues.push("Missing og:image");

  // JSON-LD @type inventory.
  const schemas = extractSchemas(html);
  if (schemas.types.length === 0) issues.push("No JSON-LD schema found");

  // Image alt text.
  const imagesWithoutAlt = extractImagesWithoutAlt(html);
  if (imagesWithoutAlt.length > 0) issues.push(`${imagesWithoutAlt.length} image(s) missing alt text`);

  // Canonical hygiene — self-referential, on our host.
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if (!canonicalMatch) issues.push("Missing canonical link");
  else if (!canonicalMatch[1].includes(CONFIG.host)) {
    issues.push(`Canonical points off-domain: ${canonicalMatch[1]}`);
  }

  // Stray noindex guard.
  const robotsMeta = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i);
  if (robotsMeta && /noindex/i.test(robotsMeta[1])) {
    issues.push(`Page is noindex (robots="${robotsMeta[1]}") — should be indexable`);
  }

  // Content freshness (> 180 days stale for a slow-moving profile).
  const dateModified = extractDateModified(html);
  let freshnessIssue = false;
  if (dateModified) {
    const daysSince = Math.floor((Date.now() - new Date(dateModified).getTime()) / 86_400_000);
    if (daysSince > 180) {
      freshnessIssue = true;
      issues.push(`Content stale — dateModified is ${daysSince} days old (last: ${dateModified})`);
    }
  }

  // Broken internal links.
  let brokenLinks: string[] = [];
  if (options.checkLinks) {
    brokenLinks = await checkBrokenLinks(extractInternalLinks(html), logger);
    for (const bl of brokenLinks) issues.push(`Broken internal link: ${bl}`);
  }

  // Core Web Vitals.
  let cwv: CWVResult | null = null;
  if (options.checkCWV) {
    logger.info(`  Checking CWV for ${pagePath}...`);
    cwv = await checkCoreWebVitals(url, logger);
    if (cwv) {
      if (cwv.lcpStatus === "poor") issues.push(`Poor LCP: ${(cwv.lcp / 1000).toFixed(1)}s (should be < 2.5s)`);
      else if (cwv.lcpStatus === "needs-improvement") issues.push(`LCP needs improvement: ${(cwv.lcp / 1000).toFixed(1)}s (target < 2.5s)`);
      if (cwv.cls > 0.25) issues.push(`Poor CLS: ${cwv.cls.toFixed(3)} (should be < 0.1)`);
      else if (cwv.cls > 0.1) issues.push(`CLS needs improvement: ${cwv.cls.toFixed(3)} (target < 0.1)`);
      if (cwv.inpStatus === "poor") issues.push(`Poor INP: ${cwv.inp.toFixed(0)}ms (should be < 200ms)`);
      else if (cwv.inpStatus === "needs-improvement") issues.push(`INP needs improvement: ${cwv.inp.toFixed(0)}ms (target < 200ms)`);
      if (cwv.performance < 50) issues.push(`Low performance score: ${cwv.performance.toFixed(0)}/100`);
    }
  }

  let severity: AuditResult["severity"] = "pass";
  if (issues.length > 0) {
    const hasCritical = issues.some(
      (i) =>
        i.includes("Missing <title>") ||
        i.includes("Missing H1") ||
        i.includes("No JSON-LD") ||
        i.includes("HTTP ") ||
        i.includes("Poor LCP") ||
        i.includes("Poor CLS") ||
        i.includes("is noindex") ||
        i.includes("Missing canonical"),
    );
    severity = hasCritical ? "critical" : "warning";
  }

  const result: AuditResult = {
    url,
    status,
    title,
    titleLength,
    description,
    descriptionLength,
    h1: h1Match,
    h1Count,
    ogTitle,
    ogDescription,
    ogImage,
    schemaTypes: schemas.types,
    brokenLinks,
    imagesWithoutAlt,
    cwv,
    dateModified,
    freshnessIssue,
    issues,
    severity,
  };

  const schemaLabel = schemas.types.length > 0 ? schemas.types.join(", ") : "none";
  if (severity === "pass") {
    logger.success(`${pagePath} — ${schemas.types.length} schemas [${schemaLabel}]`, result);
  } else if (severity === "warning") {
    logger.warn(`${pagePath} — ${issues.length} issue(s) [${schemaLabel}]`, result);
    for (const issue of issues) console.log(`        - ${issue}`);
  } else {
    logger.error(`${pagePath} — ${issues.length} issue(s) [${schemaLabel}]`, result);
    for (const issue of issues) console.log(`        - ${issue}`);
  }
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(HELP);
    return;
  }

  const logger = new Logger("audit", "schema-audit");
  const checkAll = args.includes("--all") || args.includes("--full");
  const checkCWV = args.includes("--cwv") || args.includes("--full");
  const checkLinks = args.includes("--links") || args.includes("--full");
  const singlePage = args.find((a) => a.startsWith("/"));
  const options: AuditOptions = { checkCWV, checkLinks };

  console.log("\n  alioahmed — Schema & SEO Audit");
  console.log("  ==============================\n");

  if (singlePage) {
    logger.info(`Auditing single page: ${getFullUrl(singlePage)}`);
    const result = await auditPage(singlePage, logger, options);
    logger.save({ mode: "single", page: singlePage, severity: result.severity, issueCount: result.issues.length });
    return;
  }

  const pages = checkAll ? await getAuditPages() : STATIC_PAGES;
  const features: string[] = [];
  if (checkCWV) features.push("CWV");
  if (checkLinks) features.push("broken links");
  const featureLabel = features.length > 0 ? ` + ${features.join(", ")}` : "";
  logger.info(`Auditing ${pages.length} pages${featureLabel}`);

  const results: AuditResult[] = [];
  for (const page of pages) results.push(await auditPage(page, logger, options));

  const passed = results.filter((r) => r.severity === "pass").length;
  const warnings = results.filter((r) => r.severity === "warning").length;
  const critical = results.filter((r) => r.severity === "critical").length;
  const totalIssues = results.reduce((s, r) => s + r.issues.length, 0);

  console.log("\n  ------------------------------------");
  console.log("  AUDIT SUMMARY");
  console.log("  ------------------------------------");
  console.log(`  Pages audited: ${pages.length}`);
  console.log(`  Passed:        ${passed}`);
  console.log(`  Warnings:      ${warnings}`);
  console.log(`  Critical:      ${critical}`);
  console.log(`  Total issues:  ${totalIssues}`);

  if (critical > 0) {
    console.log("\n  Critical pages:");
    for (const r of results.filter((r) => r.severity === "critical")) {
      console.log(`    ${r.url.replace(CONFIG.siteUrl, "") || "/"}: ${r.issues.join("; ")}`);
    }
  }
  if (warnings > 0) {
    console.log("\n  Pages with warnings:");
    for (const r of results.filter((r) => r.severity === "warning")) {
      console.log(`    ${r.url.replace(CONFIG.siteUrl, "") || "/"}: ${r.issues.join("; ")}`);
    }
  }

  // Cross-page duplicate title / meta detection.
  const titleMap = new Map<string, string[]>();
  const descMap = new Map<string, string[]>();
  for (const r of results) {
    if (r.title) titleMap.set(r.title, [...(titleMap.get(r.title) ?? []), r.url]);
    if (r.description) descMap.set(r.description, [...(descMap.get(r.description) ?? []), r.url]);
  }
  const dupTitles = [...titleMap].filter(([, u]) => u.length > 1);
  const dupDescs = [...descMap].filter(([, u]) => u.length > 1);
  if (dupTitles.length > 0 || dupDescs.length > 0) {
    console.log("\n  Duplicate metadata (each should be unique site-wide):");
    for (const [val, urls] of dupTitles) {
      console.log(`    TITLE x${urls.length}: "${val}"  ->  ${urls.map((u) => u.replace(CONFIG.siteUrl, "") || "/").join(", ")}`);
    }
    for (const [val, urls] of dupDescs) {
      console.log(`    META  x${urls.length}: "${val.slice(0, 50)}…"  ->  ${urls.map((u) => u.replace(CONFIG.siteUrl, "") || "/").join(", ")}`);
    }
  } else {
    console.log("\n  No duplicate titles or meta descriptions.");
  }

  if (checkCWV) {
    const cwvResults = results.filter((r) => r.cwv !== null);
    if (cwvResults.length > 0) {
      const avgPerf = cwvResults.reduce((s, r) => s + (r.cwv?.performance || 0), 0) / cwvResults.length;
      const avgLcp = cwvResults.reduce((s, r) => s + (r.cwv?.lcp || 0), 0) / cwvResults.length;
      const avgCls = cwvResults.reduce((s, r) => s + (r.cwv?.cls || 0), 0) / cwvResults.length;
      console.log("\n  Core Web Vitals Summary:");
      console.log(`    Avg Performance: ${avgPerf.toFixed(0)}/100`);
      console.log(`    Avg LCP: ${(avgLcp / 1000).toFixed(1)}s`);
      console.log(`    Avg CLS: ${avgCls.toFixed(3)}`);
    }
  }
  if (checkLinks) {
    const allBroken = results.flatMap((r) => r.brokenLinks);
    if (allBroken.length > 0) {
      console.log(`\n  Broken internal links: ${allBroken.length}`);
      for (const link of [...new Set(allBroken)]) console.log(`    ${link}`);
    } else {
      console.log("\n  No broken internal links found.");
    }
  }
  const totalMissingAlt = results.reduce((s, r) => s + r.imagesWithoutAlt.length, 0);
  if (totalMissingAlt > 0) console.log(`\n  Images without alt text: ${totalMissingAlt}`);

  logger.save({ mode: checkAll ? "all" : "static", pagesAudited: pages.length, passed, warnings, critical, totalIssues, checkCWV, checkLinks });
}

main().catch((err) => {
  console.error(`\n  Fatal error: ${err.message}`);
  process.exit(1);
});
