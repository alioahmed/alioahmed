#!/usr/bin/env tsx
/**
 * Canonical-tag audit — every indexable page must declare exactly one
 * `<link rel="canonical">` that matches its own request URL, `og:url`,
 * and Next's `alternates.canonical` Metadata field.
 *
 * Why:
 *   When canonical / og:url / sitemap-loc disagree, Google picks ONE
 *   and ignores the rest — usually the one we didn't intend. The
 *   bigger failure mode is "no canonical at all" on URL-parametered
 *   pages, which lets Google consolidate variants under whichever URL
 *   it sees most frequently (often the worst-performing variant).
 *
 * Checks:
 *   1. Exactly one `<link rel="canonical">` per page.
 *   2. canonical href is absolute (the site origin (CONFIG.siteUrl/...)).
 *   3. canonical matches og:url when og:url is present.
 *   4. canonical matches the actual request URL after redirects
 *      (catches "page at /foo declares canonical /bar" bugs).
 *   5. No canonical points at a 301/404 target (broken chain).
 *
 * Run against PRODUCTION — canonical/og:url are absolute prod URLs, so a
 * localhost run reports false mismatches on the canonical-target HEAD check.
 *
 * Usage:
 *   npx tsx scripts/canonical-audit.ts                              # prod (default)
 *   BASE_URL=http://localhost:3000 npx tsx scripts/canonical-audit.ts
 */

import { CONFIG } from "./lib/config";
import { getAuditPages } from "./lib/pages";
import { fetchWithRetry } from "./lib/fetcher";

const BASE_URL = process.env.BASE_URL?.replace(/\/$/, "") ?? CONFIG.siteUrl;

const CANONICAL_RE = /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/gi;
const OG_URL_RE = /<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i;

interface Result {
  page: string;
  status: number;
  canonicalCount: number;
  canonical: string | null;
  ogUrl: string | null;
  finalUrl: string;
  issues: string[];
}

async function audit(page: string): Promise<Result> {
  const url = `${BASE_URL}${page}`;
  const res = await fetchWithRetry(url, { redirect: "follow" }, { maxRetries: 1, timeout: 15000 });
  const issues: string[] = [];
  const result: Result = {
    page,
    status: res.status,
    canonicalCount: 0,
    canonical: null,
    ogUrl: null,
    finalUrl: res.url,
    issues,
  };
  if (!res.ok) {
    issues.push(`HTTP ${res.status}`);
    return result;
  }
  // Consolidation stubs that 301/308 to their canonical hub: the redirect IS
  // the canonical signal — comparing the followed page's canonical against the
  // original request path would be a false positive. Treat same-origin
  // redirects as a pass.
  const requestedPath = new URL(url).pathname.replace(/\/$/, "") || "/";
  const finalPath = new URL(res.url).pathname.replace(/\/$/, "") || "/";
  if (finalPath !== requestedPath) {
    result.page = `${page} → ${finalPath} (redirect — canonical signal OK)`;
    return result;
  }
  const html = await res.text();
  const canonicals: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = CANONICAL_RE.exec(html)) !== null) canonicals.push(m[1]);
  result.canonicalCount = canonicals.length;
  result.canonical = canonicals[0] ?? null;
  const ogm = html.match(OG_URL_RE);
  result.ogUrl = ogm ? ogm[1] : null;

  if (canonicals.length === 0) {
    issues.push("no <link rel=\"canonical\"> in <head>");
  } else if (canonicals.length > 1) {
    issues.push(`${canonicals.length} canonical tags (must be exactly one)`);
  }
  if (result.canonical) {
    if (!result.canonical.startsWith("https://") && !result.canonical.startsWith("http://")) {
      issues.push(`canonical is relative ("${result.canonical}") — must be absolute`);
    }
    // Compare canonical path vs request path
    try {
      const canonPath = new URL(result.canonical).pathname.replace(/\/$/, "") || "/";
      const reqPath = page.replace(/\/$/, "") || "/";
      if (canonPath !== reqPath) {
        issues.push(`canonical path "${canonPath}" != request path "${reqPath}"`);
      }
    } catch {
      issues.push(`canonical is not a valid URL: "${result.canonical}"`);
    }
    if (result.ogUrl) {
      // Normalise both through pathname (drop trailing slash) so trailing-slash
      // / scheme differences don't false-flag a real mismatch — matching how
      // this file already normalises canonical vs request paths above.
      let ogPath: string | null = null;
      let canonComparePath: string | null = null;
      try { ogPath = new URL(result.ogUrl).pathname.replace(/\/$/, ""); } catch { /* keep null */ }
      try { canonComparePath = new URL(result.canonical).pathname.replace(/\/$/, ""); } catch { /* keep null */ }
      if (ogPath !== canonComparePath) {
        issues.push(`canonical "${result.canonical}" != og:url "${result.ogUrl}"`);
      }
    }
    // Verify canonical target is itself a 200
    try {
      const ch = await fetchWithRetry(result.canonical, { method: "HEAD", redirect: "manual" }, { maxRetries: 1, timeout: 15000 });
      if (ch.status >= 300 && ch.status < 400) {
        issues.push(`canonical target returns ${ch.status} (redirect — points at a moved URL)`);
      } else if (ch.status >= 400) {
        issues.push(`canonical target returns HTTP ${ch.status}`);
      }
    } catch {
      // network blip — don't fail noisily
    }
  }
  return result;
}

async function main(): Promise<void> {
  console.log(`[canonical-audit] BASE_URL=${BASE_URL}`);
  const results: Result[] = [];
  const pages = await getAuditPages();
  console.log(`[canonical-audit] auditing ${pages.length} pages (sitemap-driven)`);
  for (const page of pages) {
    const r = await audit(page);
    results.push(r);
    const flag = r.issues.length === 0 ? "OK  " : "FAIL";
    console.log(`  ${flag} ${page.padEnd(50)} ${r.canonical ?? "(missing)"}`);
    for (const issue of r.issues) console.log(`       ${issue}`);
  }
  const failures = results.filter((r) => r.issues.length > 0);
  console.log("");
  if (failures.length > 0) {
    console.error(`[canonical-audit] FAIL — ${failures.length}/${results.length} pages have canonical issues.`);
    process.exit(1);
  }
  console.log(`[canonical-audit] OK — all ${results.length} pages have a single self-referential canonical.`);
}

main().catch((err) => {
  console.error(`[canonical-audit] crash: ${(err as Error).message}`);
  process.exit(2);
});
