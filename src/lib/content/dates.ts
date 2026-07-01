/**
 * CONTENT FRESHNESS — the ONE place to resolve per-route dates. Feeds (per page): the visible
 * "Last updated" label (when a page adds one), JSON-LD dateModified, and sitemap lastmod.
 *
 * `modified` is now GIT-DERIVED: pageDates(path) reads the last material commit date of the
 * route's source file from src/.generated/page-dates.json (built by `npm run gen:page-dates`).
 * This keeps dates DISTINCT per page automatically — identical dates across pages read as
 * fake-freshness to search/AI crawlers and hurt E-E-A-T. If a route has no git-derived date yet
 * (new/untracked), it falls back to CONTENT_LAST_MODIFIED so the signature never returns null.
 */

import type { PageDate } from '@/lib/types'
import { gitDateForRoute } from '@/lib/page-dates'

export const CONTENT_DATE_PUBLISHED = '2026-06-30'
export const CONTENT_LAST_MODIFIED = '2026-06-30'

/**
 * Per-page dates for a route. `modified` comes from git history; `published` uses the site
 * publish constant (the git snapshot stores a single "last material change" date per file, not a
 * creation date). Same exported signature as before — callers (sitemap.ts, schema, pages) unchanged.
 */
export function pageDates(path: string): PageDate {
  return {
    published: CONTENT_DATE_PUBLISHED,
    modified: gitDateForRoute(path) ?? CONTENT_LAST_MODIFIED,
  }
}
