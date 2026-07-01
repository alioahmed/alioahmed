/**
 * GIT-DERIVED PAGE DATES — reads src/.generated/page-dates.json (emitted by
 * `npm run gen:page-dates` from git history) and maps App Router routes to the
 * last MATERIAL commit date of their source file.
 *
 * Why: real, distinct per-page lastmod dates (never a blanket "today") are the
 * only freshness signal search/AI crawlers trust. Deriving them from git — and
 * committing the snapshot so Vercel's shallow clone reads a static file — keeps
 * every page's date honest without hand-maintenance.
 *
 * dates.ts consumes this; callers (sitemap.ts, schema, page.tsx) keep using
 * pageDates() unchanged.
 */

import pageDatesJson from '@/.generated/page-dates.json'

const DATES = pageDatesJson as Record<string, string>

/** Last-modified calendar day (YYYY-MM-DD) for a repo-relative source file, or null. */
export function gitDateForFile(file: string): string | null {
  const iso = DATES[file]
  return iso ? iso.slice(0, 10) : null
}

/** Map a route path to its App Router page source file. "/" → src/app/page.tsx. */
export function routeToSourceFile(route: string): string {
  const clean = route.replace(/\/+$/, '')
  return clean === '' ? 'src/app/page.tsx' : `src/app${clean}/page.tsx`
}

/** Git-derived modified date for a route (via its page.tsx), or null if absent. */
export function gitDateForRoute(route: string): string | null {
  return gitDateForFile(routeToSourceFile(route))
}
