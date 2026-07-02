/**
 * NAVIGATION + ROUTE MAP — the site structure. The map is the single place that defines what
 * exists and how it links: nav, footer, and sitemap all derive from ROUTES automatically.
 */

import type { NavItem } from '@/lib/types'
import { CASE_STUDIES } from './case-studies'

/** Canonical route list (the planned sitemap). `live: false` routes aren't built yet. */
export const ROUTES: { path: string; label: string; live: boolean; inNav: boolean }[] = [
  { path: '/', label: 'Home', live: true, inNav: false },
  { path: '/work', label: 'Work', live: true, inNav: true },
  { path: '/about', label: 'About', live: true, inNav: true },
  { path: '/writing', label: 'Writing', live: false, inNav: true },
  { path: '/contact', label: 'Contact', live: true, inNav: true },
  // Case-study detail pages — live, not in the top nav (reached via /work + in-content links).
  ...CASE_STUDIES.map((cs) => ({
    path: `/work/${cs.slug}`,
    label: cs.title,
    live: true,
    inNav: false,
  })),
]

/**
 * Primary navigation — only routes that are BOTH in-nav AND live. This prevents linking (and
 * Next prefetching) pages that don't exist yet. Routes appear automatically once `live: true`.
 */
export const NAV: NavItem[] = ROUTES.filter((r) => r.inNav && r.live).map((r) => ({
  label: r.label,
  href: r.path,
}))

/** Footer link groups — Site nav + the flagship work, all guaranteed-live. */
export const FOOTER_LINKS: { heading: string; items: NavItem[] }[] = [
  { heading: 'Site', items: NAV },
  {
    heading: 'Selected work',
    items: CASE_STUDIES.filter((cs) => cs.featured || cs.slug === 'paralegent').map((cs) => ({
      label: cs.title,
      href: `/work/${cs.slug}`,
    })),
  },
]

/** Routes that are currently live (built) — what sitemap.ts should emit. */
export const LIVE_ROUTES = ROUTES.filter((r) => r.live)
