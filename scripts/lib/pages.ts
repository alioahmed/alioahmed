import { CONFIG, STATIC_PAGES } from "./config";
import { parseSitemap } from "./sitemap-parser";

/**
 * Canonical page source for every audit/submission script.
 *
 * Why this exists:
 *   STATIC_PAGES is a hand-maintained list that silently drifts — the live
 *   sitemap is generated from the app router at build time, so new pages
 *   (work entries, project pages, writing posts) appear there automatically
 *   while the hand list lags. Audits that iterate the stale list miss the new
 *   pages entirely and waste quota on removed ones.
 *
 * Contract:
 *   - Source of truth = the deployed sitemap (src/app/sitemap.ts emits it
 *     from the router; redirect stubs are already excluded). New pages are
 *     covered the moment they ship.
 *   - Honors BASE_URL so audits can target a local build (via sitemap-parser).
 *   - Falls back to STATIC_PAGES (loudly) only when the sitemap is
 *     unreachable — never silently.
 */
export async function getAuditPages(): Promise<string[]> {
  try {
    const urls = await parseSitemap();
    const paths = [...new Set(urls.map((u) => new URL(u).pathname.replace(/\/$/, "") || "/"))].sort();
    if (paths.length === 0) throw new Error("sitemap parsed to zero URLs");
    return paths;
  } catch (err) {
    console.warn(
      `  WARN sitemap unreachable (${err instanceof Error ? err.message : err}) — ` +
        `falling back to STATIC_PAGES (${STATIC_PAGES.length} entries, may be stale!)`
    );
    return [...STATIC_PAGES];
  }
}

export { CONFIG };
