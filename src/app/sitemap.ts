import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'
import { LIVE_ROUTES, pageDates } from '@/lib/content'

/**
 * Sitemap — emits only LIVE routes from the route map, each with its real per-route lastModified
 * from the freshness system (never one shared date — blanket "today" dates make Google distrust
 * ALL your lastmods). `priority`/`changeFrequency` are omitted on purpose: Google ignores both,
 * and honest `lastmod` is the only sitemap freshness signal that counts. New routes appear here
 * automatically as they are flagged `live: true` in content/navigation.ts.
 *
 * If any section ever exceeds 50k URLs, split it with generateSitemaps() into a sitemap index.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return LIVE_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(pageDates(route.path).modified),
  }))
}
