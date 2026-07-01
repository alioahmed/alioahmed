import { fetchWithRetry } from "./fetcher";
import { CONFIG } from "./config";

/**
 * The single sitemap-walking implementation.
 *
 * - Follows sitemap indexes recursively (if sitemap.xml is an index).
 * - Skips image sitemaps (they list images, not pages).
 * - Decodes the five standard XML entities in <loc> values.
 * - `base` defaults to BASE_URL env, then production (CONFIG.siteUrl).
 * - parseSitemapEntries() also returns each URL's <lastmod>.
 *
 * Backwards-compatible: parseSitemap() keeps its original "array of URL
 * strings" contract, so existing callers are unaffected.
 */

export interface SitemapEntry {
  loc: string;
  lastmod: string | null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export async function parseSitemapEntries(base?: string): Promise<SitemapEntry[]> {
  const root = (base ?? process.env.BASE_URL ?? CONFIG.siteUrl).replace(/\/$/, "");
  return walk(`${root}/sitemap.xml`);
}

/** Back-compat helper: just the URLs. */
export async function parseSitemap(base?: string): Promise<string[]> {
  return (await parseSitemapEntries(base)).map((e) => e.loc);
}

async function walk(url: string): Promise<SitemapEntry[]> {
  const response = await fetchWithRetry(url, undefined, { maxRetries: 1, timeout: 15000 });
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${url} (${response.status})`);
  }
  const xml = await response.text();

  if (xml.includes("<sitemapindex")) {
    const subs: string[] = [];
    const locRe = /<loc>([^<]+\.xml[^<]*)<\/loc>/g;
    let m: RegExpExecArray | null;
    while ((m = locRe.exec(xml)) !== null) {
      const loc = decodeEntities(m[1]);
      if (!/sitemap-images/.test(loc)) subs.push(loc);
    }
    const results = await Promise.all(subs.map((s) => walk(s).catch(() => [] as SitemapEntry[])));
    return results.flat();
  }

  const out: SitemapEntry[] = [];
  const urlRe = /<url>([\s\S]*?)<\/url>/g;
  let m: RegExpExecArray | null;
  while ((m = urlRe.exec(xml)) !== null) {
    const blockXml = m[1];
    const loc = blockXml.match(/<loc>([^<]+)<\/loc>/);
    if (!loc) continue;
    const lastmod = blockXml.match(/<lastmod>([^<]+)<\/lastmod>/);
    out.push({ loc: decodeEntities(loc[1]), lastmod: lastmod ? lastmod[1] : null });
  }
  // Plain sitemaps without <url> wrappers (defensive)
  if (out.length === 0) {
    const locRe = /<loc>([^<]+)<\/loc>/g;
    while ((m = locRe.exec(xml)) !== null) out.push({ loc: decodeEntities(m[1]), lastmod: null });
  }
  return out;
}
