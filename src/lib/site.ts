/**
 * SITE_CONFIG — the single indirection layer between content and the SEO/schema/metadata
 * libraries. Derived from the content layer (src/lib/content/profile.ts). For full content,
 * import from "@/lib/content" instead.
 */

import { PROFILE, BIO, PROFILES, SAME_AS as PROFILE_SAME_AS } from '@/lib/content/profile'

const FALLBACK_URL = 'https://alioahmed.vercel.app'

/** Absolute site origin, no trailing slash. Env-driven so the domain can flip later. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_URL).replace(/\/$/, '')

/** Profile URLs keyed by platform (e.g. SITE_CONFIG.profiles.linkedin). */
const profilesByKey = Object.fromEntries(PROFILES.map((p) => [p.key, p.url])) as Record<
  string,
  string
>

export const SITE_CONFIG = {
  name: PROFILE.name,
  handle: PROFILE.handle,
  url: SITE_URL,
  locale: 'en',
  title: PROFILE.title,
  titleFull: PROFILE.titleFull,
  tagline: PROFILE.positioningLine,
  description: BIO.standard,
  image: PROFILE.image,
  location: PROFILE.location,
  contact: PROFILE.contact,
  entityAnchors: PROFILE.entityAnchors,
  profiles: profilesByKey,
  twitterHandle: '@Alioahmed_',
  /** The one canonical "Name — Title" string. Use everywhere (metadata, OG, manifest, layout). */
  defaultTitle: `${PROFILE.name} — ${PROFILE.title}`,
} as const

/** Identity profiles as a flat sameAs array. */
export const SAME_AS: string[] = PROFILE_SAME_AS

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
