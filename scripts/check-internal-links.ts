#!/usr/bin/env tsx
/**
 * Internal-link equity checker.
 *
 * Runs against a built + running Next.js server. Crawls every URL in the
 * sitemap and counts EDITORIAL (in-content) internal links each page receives —
 * the signal that distributes internal PageRank. Global nav/footer links point
 * nearly everywhere, so we strip <header>/<footer>/<nav> (prefer <main>) so a
 * page's score reflects genuine contextual links.
 *
 *   - ORPHANS: 0 incoming in-content links (a clear ranking handicap).
 *   - LOW IN-LINKS: < MIN_INLINKS incoming (under-linked, leaves rankings on the table).
 *
 * Host is config-driven. Exit 0 = no orphans · 1 = one or more orphan pages.
 */

import { fetchWithRetry } from "./lib/fetcher";
import { parseSitemap } from "./lib/sitemap-parser";
import { CONFIG } from "./lib/config";

const BASE_URL = process.env.BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
const MIN_INLINKS = 2;

/* Utility pages that will only ever be linked from the global footer (stripped
   from the in-content scan) are "orphans" by design — exclude them as they ship. */
const EXCLUDE = new Set<string>(["/terms", "/privacy"]);

const HOST_RE = new RegExp(`^https?://(www\\.)?${CONFIG.host.replace(/\./g, "\\.")}`, "i");

function normalizePath(href: string): string | null {
  if (!href) return null;
  let h = href.trim();
  h = h.replace(HOST_RE, "");
  if (/^https?:\/\//i.test(h)) return null; // external
  if (/^(mailto:|tel:|#|javascript:|wa\.me)/i.test(h)) return null;
  if (!h.startsWith("/")) return null;
  h = h.split("#")[0].split("?")[0];
  if (h.length > 1 && h.endsWith("/")) h = h.slice(0, -1);
  return h || "/";
}

function contentRegion(html: string): string {
  const main = html.match(/<main[\s>][\s\S]*?<\/main>/i);
  if (main) return main[0];
  let body = html;
  const b = html.search(/<body/i);
  if (b >= 0) body = html.slice(b);
  return body
    .replace(/<header[\s>][\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s>][\s\S]*?<\/footer>/gi, "")
    .replace(/<nav[\s>][\s\S]*?<\/nav>/gi, "");
}

function extractContentLinks(html: string): Set<string> {
  const region = contentRegion(html);
  const out = new Set<string>();
  const re = /<a\s[^>]*href="([^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(region)) !== null) {
    const p = normalizePath(m[1]);
    if (p) out.add(p);
  }
  return out;
}

async function fetchSitemapPaths(): Promise<string[]> {
  const locs = await parseSitemap(BASE_URL);
  const paths = locs.map((l) => normalizePath(l)).filter((p): p is string => p !== null);
  return [...new Set(paths)];
}

async function main(): Promise<void> {
  console.log(`[check-internal-links] BASE_URL=${BASE_URL}`);
  const paths = await fetchSitemapPaths();
  console.log(`  sitemap: ${paths.length} URLs — crawling for in-content links…`);

  const knownSet = new Set(paths);
  const inLinks = new Map<string, number>(paths.map((p) => [p, 0]));

  for (const p of paths) {
    const res = await fetchWithRetry(
      `${BASE_URL}${p}`,
      { headers: { "User-Agent": "alioahmed-link-graph/1.0" } },
      { maxRetries: 1, timeout: 15000 },
    );
    if (res.status !== 200) {
      console.log(`  SKIP ${p} (status ${res.status})`);
      continue;
    }
    const html = await res.text();
    for (const t of extractContentLinks(html)) {
      if (t !== p && knownSet.has(t)) inLinks.set(t, (inLinks.get(t) ?? 0) + 1);
    }
  }

  const orphans = paths.filter(
    (p) => p !== "/" && !EXCLUDE.has(p) && (inLinks.get(p) ?? 0) === 0,
  );
  const lowInlinks = paths.filter(
    (p) => p !== "/" && !EXCLUDE.has(p) && (inLinks.get(p) ?? 0) > 0 && (inLinks.get(p) ?? 0) < MIN_INLINKS,
  );
  const counts = [...inLinks.values()];
  const avg = counts.reduce((s, n) => s + n, 0) / (counts.length || 1);

  console.log("");
  if (orphans.length > 0) {
    console.log(`  ORPHANS (0 incoming in-content links) — ${orphans.length}:`);
    for (const p of orphans) console.log(`    x ${p}`);
  } else {
    console.log("  No orphan pages.");
  }
  if (lowInlinks.length > 0) {
    console.log(`\n  LOW IN-LINKS (< ${MIN_INLINKS}) — ${lowInlinks.length}:`);
    for (const p of lowInlinks) console.log(`    ~ ${p}  (${inLinks.get(p)} inlink)`);
  }

  console.log(
    `\n[check-internal-links] ${paths.length} pages · avg in-content links ${avg.toFixed(1)} · ${orphans.length} orphan · ${lowInlinks.length} low`,
  );
  if (orphans.length > 0) {
    console.error("\nFAIL — orphan pages receive no editorial internal links. Add contextual");
    console.error("links to them from relevant hubs/pages so they earn internal PageRank.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`[check-internal-links] crash: ${(err as Error).message}`);
  process.exit(2);
});
