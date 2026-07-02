/**
 * Content model for the personal site — the type system the data layer is built on.
 *
 * This site is PERSON-shaped (experience, projects, credentials, recognition, writing), not
 * company-shaped. Every content file in src/lib/content/* is typed against these interfaces so
 * the data is the single, consistent source of truth that pages + schema compile down from.
 */

/** A single proof figure, e.g. { value: "75,000+", label: "transactions" }. */
export interface Metric {
  value: string
  label: string
  note?: string
}

/** A social/identity profile — the sameAs entity-fusion set. */
export interface SocialProfile {
  /** Stable key, e.g. "linkedin". */
  key: string
  label: string
  url: string
  handle?: string
  /** Include in the JSON-LD Person.sameAs array. */
  sameAs?: boolean
}

export type ExperienceKind =
  | 'founder' // Wonder Women
  | 'operator' // Cognilium, Bijli Bachao
  | 'institutional' // CIRCLE/Gates, UNIDO, GIZ
  | 'ecosystem' // ID92 / EWC / SEE
  | 'early' // origin years

export type Tense = 'present' | 'past'

/** A role in the career spine. `role` is the LOCKED title — never reword it. */
export interface Experience {
  slug: string
  org: string
  orgUrl?: string
  role: string
  kind: ExperienceKind
  /** Sortable YYYY-MM. */
  start: string
  end: string | 'present'
  /** Human label, e.g. "May 2022 – Oct 2024". */
  dateLabel: string
  location?: string
  tense: Tense
  /** One-line what-this-was. */
  summary: string
  highlights: string[]
  metrics?: Metric[]
  /** Institutions/partners earned in this role (drives the trust bar). */
  trustedBy?: string[]
  tags?: string[]
  featured?: boolean
}

export type ProjectKind = 'ai-product' | 'iot-platform' | 'venture' | 'hardware'

export type ProjectStatus = 'production' | 'live' | 'pre-launch' | 'shipped' | 'archived'

/** Something Ali built (the portfolio). */
export interface Project {
  slug: string
  name: string
  tagline: string
  kind: ProjectKind
  /** Where it was built — "Cognilium AI", "Bijli Bachao", or "Independent". */
  org: string
  /** Ali's LOCKED role on it. */
  role: string
  status: ProjectStatus
  year?: string
  summary: string
  highlights?: string[]
  metrics?: Metric[]
  stack?: string[]
  url?: string
  featured?: boolean
}

export interface Education {
  degree: string
  field?: string
  institution: string
  year?: string
}

export interface Award {
  name: string
  issuer?: string
  year?: string
  detail?: string
}

export type InstitutionKind =
  'funder' | 'un' | 'government' | 'enterprise' | 'hospital' | 'university'

/** A name in the institutional spine — the "trusted by" proof. */
export interface Institution {
  name: string
  short?: string
  kind: InstitutionKind
  /** How to honestly describe the relationship, e.g. "trusted to deliver programmes". */
  relationship: string
  url?: string
}

/** A defensible capability cluster (maps to knowsAbout + the "what I do" section). */
export interface Capability {
  title: string
  description: string
  skills: string[]
}

/** An audience the site serves (hiring teams, founders/clients) — drives "work with me". */
export interface Audience {
  slug: string
  title: string
  pitch: string
  cta?: { label: string; href: string }
}

/** A headline proof number for the stats bank. */
export interface Stat {
  value: string
  label: string
  emphasis?: boolean
}

export interface Faq {
  question: string
  answer: string
}

/** The five canonical bio lengths (verbatim from BIO-SHEET-ALI.md). */
export interface BioVariants {
  tagline: string
  micro: string
  short: string
  standard: string
  long: string
}

/** A renderable block inside a case study — the typed long-form layer. */
export type CaseBlock =
  | { kind: 'text'; heading?: string; paras: string[] }
  | { kind: 'bullets'; heading?: string; intro?: string; items: string[] }
  | { kind: 'stats'; heading?: string; stats: Metric[] }
  | {
      kind: 'cards'
      heading?: string
      cards: { title: string; body: string; bullets?: string[]; href?: string }[]
    }

/**
 * A deep-dive work page (/work/[slug]). The required fields ENCODE the answer-engine gate:
 * `answerCapsule` (20–70 words, link-free), `questionHeading` (contains "?"), and at least one
 * bullets block (the <ul>). Copy compiles from canonical/*.md only — locked titles verbatim.
 */
export interface CaseStudy {
  slug: string
  /** Card/hero eyebrow, e.g. "Cognilium AI · AI products". */
  eyebrow: string
  /** H1. */
  title: string
  /** Metadata title (layout template appends "· Ali Ahmed"). */
  seoTitle: string
  seoDescription: string
  /** Ali's LOCKED title on this chapter — never reword. */
  role: string
  dateLabel: string
  status?: 'live' | 'production' | 'pre-launch' | 'concluded'
  /** 20–70 words, LINK-FREE — the early answer capsule the AEO gate requires. */
  answerCapsule: string
  /** An H2 containing "?" — the question heading the AEO gate requires. */
  questionHeading: string
  /** Hero figures (StatTile row). */
  heroStats: Metric[]
  sections: CaseBlock[]
  /** Page-scoped Q&A (≥2) — rendered + FAQPage schema. */
  faqs: Faq[]
  /** In-content related links (the internal-link graph edges). */
  related: { slug: string; label: string }[]
  /** PROJECTS slugs this page is about → SoftwareApplication/CreativeWork schema nodes. */
  projectSlugs?: string[]
  /** Live product link, e.g. paralegent.ai. */
  external?: { label: string; href: string }
  /** Featured on home. */
  featured?: boolean
}

/** Where/how Ali can engage — the recruiter-facing availability block. */
export interface Availability {
  headline: string
  modes: string[]
  regions: string[]
  roles: string[]
}

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

/** Per-route freshness dates (feeds sitemap lastmod + JSON-LD dateModified + visible bar). */
export interface PageDate {
  published: string
  modified: string
}
