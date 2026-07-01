/**
 * PROFILE — the identity core (the "COMPANY" equivalent for a personal site).
 * Sourced from BIO-SHEET-ALI.md (locked canonical block + bio variants) and
 * canonical/00-WHO-ALI-IS.md. Bio variants are VERBATIM — do not reword per surface.
 *
 * Guardrails: title is "AI Solutions Engineer" (never Founder/CEO of Cognilium — that is
 * Mudassir's). Name always "Ali Ahmed" (never "Ahmad"). Handle always "alioahmed".
 */

import type { BioVariants, SocialProfile } from '@/lib/types'

export const PROFILE = {
  name: 'Ali Ahmed',
  firstName: 'Ali',
  handle: 'alioahmed',

  // Titles — workhorse first.
  title: 'AI Solutions Engineer',
  titleFull: 'AI Solutions Engineer @ Cognilium AI',
  prestigeTitle: 'Forward-Deployed Engineer',
  secondaryTitle: 'Head of Product & Platforms @ Bijli Bachao',

  // The 5-second identity (from canonical §1).
  oneLiner: 'I build what I sell — and sell what I build.',
  positioningLine:
    'A founder-grade operator who ships production-grade AI products and owns the business behind them.',

  location: {
    locality: 'Lahore',
    country: 'Pakistan',
    countryCode: 'PK',
    display: 'Lahore, Pakistan',
  },

  openTo:
    'Open to remote-global roles and relocation to the Gulf (UAE/Saudi/Qatar), US, or Australia, ' +
    'plus fractional AI-delivery consulting.',

  contact: {
    // Primary public email — professional domain address (forwards to Ali's Gmail).
    email: 'ali@alioahmed.com',
    // General/inbound alias (contact form, "say hello") — also forwards to Gmail.
    emailGeneral: 'hello@alioahmed.com',
    phone: '+92-321-4309269',
    /** WhatsApp — same number as phone. Raw intl digits for wa.me links: `923214309269`. */
    whatsapp: '+923214309269',
    /** Booking URL — add when one exists; CTAs fall back to email until then. */
    booking: '',
  },

  // ONE headshot, identical everywhere (a missing/changing photo breaks entity-match).
  image: '/ali-ahmed.jpeg',

  // Entity anchors that must co-occur with the name (the disambiguators).
  entityAnchors: ['Cognilium AI', 'Bijli Bachao'] as const,
} as const

/** Bio variants — VERBATIM from BIO-SHEET-ALI.md §1. Trim to length, never reword. */
export const BIO: BioVariants = {
  tagline: 'AI Solutions Engineer @ Cognilium AI',
  micro:
    'AI Solutions Engineer — I build LLM/RAG products, AI agents & IoT platforms that ship to production. Cognilium AI · Bijli Bachao.',
  short:
    'AI Solutions Engineer. I turn vague problems into LLM/RAG products, AI agents & IoT platforms that ship to production. 4 AI products + 3 IoT platforms shipped.',
  standard:
    'Ali Ahmed is an AI Solutions Engineer who builds what he sells — turning business problems into ' +
    'LLM/RAG products, AI agents, and IoT platforms that ship to production and actually run. ' +
    'AI Solutions Engineer @ Cognilium AI · Head of Product & Platforms @ Bijli Bachao. ' +
    'Trusted on Gates Foundation & UNIDO programmes; partners incl. P&G, Engro, Aga Khan.',
  long:
    'Ali Ahmed is an AI Solutions Engineer who builds what he sells — and sells what he builds. He turns ' +
    'vague business problems into LLM/RAG products, AI agents, and IoT platforms that ship to production ' +
    'and actually run, owning both the build and the business behind it. At Cognilium AI (US & UAE clients) ' +
    'he took four AI products from idea to deployment: Paralegent (an agentic legal-AI system), VORTA (an ' +
    'enterprise RAG assistant at 92% first-call resolution), ProspectVox (a voice sales agent), and ' +
    'VectorHire (an AI recruiter). As Head of Product & Platforms at Bijli Bachao he built and runs three ' +
    'live IoT energy platforms. Earlier he co-founded Wonder Women, Pakistan’s first FemTech — closing ' +
    'Procter & Gamble, Engro, and Aga Khan University Hospital. He is trusted to deliver Gates Foundation– ' +
    'and UNIDO-backed programmes. Open to remote-global roles and relocation to the Gulf, US, or Australia.',
}

/**
 * Social/identity profiles — the sameAs entity-fusion set (THE core lever for a common name).
 * These are the CONFIRMED PUBLIC profile URLs from Ali's own bookmarks (2026-06-30). Order =
 * priority per 2026 research: Wikidata first (when created), then LinkedIn, field-native
 * (GitHub, ORCID), then the rest. `sameAs: true` → goes into the Person JSON-LD.
 *
 * Rules honored: handle is `alioahmed` everywhere it was free; X fell back to `Alioahmed_`.
 * Only public URLs here — admin/settings URLs never go in sameAs (see PENDING_PUBLIC_URLS).
 * TODO: create the Wikidata item, then add it at the top with sameAs: true.
 */
export const PROFILES: SocialProfile[] = [
  {
    key: 'linkedin',
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/alioahmed/',
    handle: 'alioahmed',
    sameAs: true,
  },
  {
    key: 'github',
    label: 'GitHub',
    url: 'https://github.com/alioahmed',
    handle: 'alioahmed',
    sameAs: true,
  },
  {
    key: 'orcid',
    label: 'ORCID',
    url: 'https://orcid.org/0009-0007-4265-3295',
    handle: '0009-0007-4265-3295',
    sameAs: true,
  },
  { key: 'x', label: 'X', url: 'https://x.com/Alioahmed_', handle: 'Alioahmed_', sameAs: true },
  {
    key: 'aboutme',
    label: 'about.me',
    url: 'https://about.me/alioahmed',
    handle: 'alioahmed',
    sameAs: true,
  },
  {
    key: 'devto',
    label: 'dev.to',
    url: 'https://dev.to/alioahmed',
    handle: 'alioahmed',
    sameAs: true,
  },
  {
    key: 'medium',
    label: 'Medium',
    url: 'https://medium.com/@alioahmed',
    handle: 'alioahmed',
    sameAs: true,
  },
  {
    key: 'hashnode',
    label: 'Hashnode',
    url: 'https://hashnode.com/@alioahmed',
    handle: 'alioahmed',
    sameAs: true,
  },
  {
    key: 'substack',
    label: 'Substack',
    url: 'https://substack.com/@alioahmed',
    handle: 'alioahmed',
    sameAs: true,
  },
  {
    key: 'huggingface',
    label: 'Hugging Face',
    url: 'https://huggingface.co/alioahmed',
    handle: 'alioahmed',
    sameAs: true,
  },
  {
    key: 'bluesky',
    label: 'Bluesky',
    url: 'https://bsky.app/profile/alioahmed.bsky.social',
    handle: 'alioahmed.bsky.social',
    sameAs: true,
  },
  {
    key: 'mastodon',
    label: 'Mastodon',
    url: 'https://mastodon.social/@alioahmed',
    handle: 'alioahmed',
    sameAs: true,
  },
  {
    key: 'kaggle',
    label: 'Kaggle',
    url: 'https://www.kaggle.com/alioahmed',
    handle: 'alioahmed',
    sameAs: true,
  },
  {
    key: 'producthunt',
    label: 'Product Hunt',
    url: 'https://www.producthunt.com/@alioahmed',
    handle: 'alioahmed',
    sameAs: true,
  },
  {
    key: 'patreon',
    label: 'Patreon',
    url: 'https://www.patreon.com/cw/alioahmed',
    handle: 'alioahmed',
    sameAs: true,
  },
  {
    key: 'goodreads',
    label: 'Goodreads',
    url: 'https://www.goodreads.com/user/show/202106301-ali-ahmed',
    sameAs: true,
  },
  {
    key: 'fueler',
    label: 'Fueler',
    url: 'https://fueler.io/alioahmed',
    handle: 'alioahmed',
    sameAs: true,
  },
  // Verified public 2026-06-30 (resolve to Ali Ahmed @alioahmed):
  {
    key: 'gitlab',
    label: 'GitLab',
    url: 'https://gitlab.com/alioahmed',
    handle: 'alioahmed',
    sameAs: true,
  },
  {
    key: 'linktree',
    label: 'Linktree',
    url: 'https://linktr.ee/alioahmed',
    handle: 'alioahmed',
    sameAs: true,
  },
  {
    key: 'topmate',
    label: 'Topmate',
    url: 'https://topmate.io/alioahmed',
    handle: 'alioahmed',
    sameAs: true,
  },
]

/**
 * Profiles Ali has claimed but where the bookmark was an admin/settings page, so the PUBLIC URL
 * needs confirming before it can join PROFILES/sameAs (a 404 in sameAs suppresses entity merge).
 * Confirm each public URL, then promote into PROFILES above.
 */
export const PENDING_PUBLIC_URLS: { platform: string; note: string }[] = [
  {
    platform: 'Wikidata',
    note: 'Item not created yet — #1 entity-SEO TODO. Add at top of sameAs once it exists.',
  },
  {
    platform: 'Gravatar',
    note: 'gravatar.com/alioahmed is a DIFFERENT person (an "ali" from Ethiopia). Find Ali’s real public Gravatar URL before adding.',
  },
  {
    platform: 'Wellfound',
    note: '403 to crawlers — verify manually. Slug may be saliahmed (bio sheet flagged it).',
  },
  { platform: 'ResearchGate', note: 'Bookmark was login page — confirm public profile URL.' },
  {
    platform: 'MLH / Blogger / RocketReach',
    note: 'Admin/aggregator pages — confirm a real public URL or skip.',
  },
]

/** Flat sameAs array for JSON-LD. */
export const SAME_AS: string[] = PROFILES.filter((p) => p.sameAs).map((p) => p.url)
