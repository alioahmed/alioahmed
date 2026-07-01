/**
 * NAVIGATION + ROUTE MAP — the intended site structure. Pages are built against this in the
 * content phase; the map is the single place that defines what exists and how it links.
 */

import type { NavItem } from '@/lib/types'

/** Canonical route list (the planned sitemap). `live: false` routes aren't built yet. */
export const ROUTES: { path: string; label: string; live: boolean; inNav: boolean }[] = [
  { path: '/', label: 'Home', live: true, inNav: false },
  { path: '/work', label: 'Work', live: false, inNav: true },
  { path: '/about', label: 'About', live: false, inNav: true },
  { path: '/writing', label: 'Writing', live: false, inNav: true },
  { path: '/contact', label: 'Contact', live: false, inNav: true },
]

/**
 * Primary navigation — only routes that are BOTH in-nav AND live. This prevents linking (and
 * Next prefetching) pages that don't exist yet. Routes appear automatically once `live: true`.
 */
export const NAV: NavItem[] = ROUTES.filter((r) => r.inNav && r.live).map((r) => ({
  label: r.label,
  href: r.path,
}))

/** Footer link groups — derived from live in-nav routes (no dead links). */
export const FOOTER_LINKS: { heading: string; items: NavItem[] }[] = NAV.length
  ? [{ heading: 'Site', items: NAV }]
  : []

/** Routes that are currently live (built) — what sitemap.ts should emit. */
export const LIVE_ROUTES = ROUTES.filter((r) => r.live)
