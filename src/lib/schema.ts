/**
 * JSON-LD schema generators — wired to the content layer (@/lib/content).
 *
 * Design: one site-wide @graph with stable @id anchors (#person, #website), declared once in the
 * ROOT LAYOUT (defaultGraph). Individual PAGES emit only their page-scoped delta nodes
 * (ProfilePage / WebPage / Breadcrumb / FAQ), which reference #person/#website by @id. Google
 * merges the two <script> blocks by @id, so the entity is never duplicated. THE CONTRACT: layout
 * owns the entity graph; a page never re-emits Person/Organization/WebSite.
 *
 * Research-pruned: no Speakable (7yr beta, news-only), no LocalBusiness (Ali is a person/
 * consultant, not a storefront), no HowTo. Project schema uses SoftwareApplication / CreativeWork.
 */

import {
  AWARDS,
  EDUCATION,
  KNOWS_ABOUT_LINKED,
  PROFILE,
  SAME_AS,
  CONTENT_LAST_MODIFIED,
} from '@/lib/content'
import type { Project } from '@/lib/types'
import { SITE_CONFIG, absoluteUrl } from '@/lib/site'

export type SchemaNode = Record<string, unknown>

/** The canonical root URL string, used consistently for every root @id and url (trailing slash). */
const ROOT = absoluteUrl('/')

/** Stable @id anchors. Root-anchored ids all use ROOT for a single, consistent slash convention. */
export const ID = {
  person: () => `${ROOT}#person`,
  profilePage: () => `${ROOT}#profilepage`,
  website: () => `${ROOT}#website`,
  cognilium: 'https://cognilium.ai/#organization',
  bijliBachao: 'https://bijlibachao.pk/#organization',
} as const

/** Organizations referenced as worksFor targets (named per guardrails — never as founder/CEO). */
const ORGANIZATIONS = [
  { id: ID.cognilium, name: 'Cognilium AI', url: 'https://cognilium.ai' },
  { id: ID.bijliBachao, name: 'Bijli Bachao', url: 'https://bijlibachao.pk' },
] as const

/** Honest default for a static page's dateModified — never build-time `new Date()`. */
const defaultDate = () => CONTENT_LAST_MODIFIED

/** Person — the entity home. The highest-leverage node: fuses scattered records into one entity. */
export function generatePersonSchema(): SchemaNode {
  const edu = EDUCATION[0]
  const orcid = SAME_AS.find((u) => u.includes('orcid.org'))
  const [givenName, ...familyParts] = PROFILE.name.split(' ')
  const familyName = familyParts.join(' ')
  return {
    '@type': 'Person',
    '@id': ID.person(),
    name: PROFILE.name,
    ...(givenName ? { givenName } : {}),
    ...(familyName ? { familyName } : {}),
    url: ROOT,
    image: absoluteUrl(PROFILE.image),
    jobTitle: PROFILE.title,
    hasOccupation: { '@type': 'Occupation', name: PROFILE.title },
    description: SITE_CONFIG.description,
    email: PROFILE.contact.email,
    worksFor: [{ '@id': ID.cognilium }, { '@id': ID.bijliBachao }],
    knowsLanguage: ['English', 'Urdu'],
    ...(edu
      ? {
          alumniOf: { '@type': 'CollegeOrUniversity', name: edu.institution },
          hasCredential: {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'degree',
            name: edu.degree,
          },
        }
      : {}),
    knowsAbout: KNOWS_ABOUT_LINKED,
    award: AWARDS.map((a) => a.name),
    ...(orcid
      ? { identifier: { '@type': 'PropertyValue', propertyID: 'ORCID', value: orcid } }
      : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: PROFILE.location.locality,
      addressCountry: PROFILE.location.countryCode,
    },
    sameAs: SAME_AS,
  }
}

/** Organization references (Cognilium AI, Bijli Bachao). */
export function generateOrganizationSchemas(): SchemaNode[] {
  return ORGANIZATIONS.map((org) => ({
    '@type': 'Organization',
    '@id': org.id,
    name: org.name,
    url: org.url,
  }))
}

/**
 * ProfilePage — the entity page node (Google's creator profile type; a WebPage subtype). This is
 * the home/about page's own node; its mainEntity is the Person. Emit ONE of ProfilePage (entity
 * page) or WebPage (generic page) per page — not both.
 */
export function generateProfilePageSchema(opts?: {
  url?: string
  datePublished?: string
  dateModified?: string
}): SchemaNode {
  const url = opts?.url ?? ROOT
  return {
    '@type': 'ProfilePage',
    '@id': ID.profilePage(),
    url,
    name: `${PROFILE.name} — ${PROFILE.title}`,
    description: SITE_CONFIG.description,
    inLanguage: SITE_CONFIG.locale,
    isPartOf: { '@id': ID.website() },
    about: { '@id': ID.person() },
    mainEntity: { '@id': ID.person() },
    datePublished: opts?.datePublished ?? defaultDate(),
    dateModified: opts?.dateModified ?? defaultDate(),
  }
}

/** WebSite — published by the Person. No SearchAction (there is no on-site search route). */
export function generateWebSiteSchema(): SchemaNode {
  return {
    '@type': 'WebSite',
    '@id': ID.website(),
    url: ROOT,
    name: SITE_CONFIG.name,
    inLanguage: SITE_CONFIG.locale,
    publisher: { '@id': ID.person() },
  }
}

/** WebPage — a standard content page, part of the WebSite, about the Person. */
export function generateWebPageSchema(opts: {
  title: string
  description: string
  url: string
  datePublished?: string
  dateModified?: string
}): SchemaNode {
  return {
    '@type': 'WebPage',
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.title,
    description: opts.description,
    inLanguage: SITE_CONFIG.locale,
    isPartOf: { '@id': ID.website() },
    about: { '@id': ID.person() },
    datePublished: opts.datePublished ?? defaultDate(),
    dateModified: opts.dateModified ?? defaultDate(),
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]): SchemaNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/** Wrap nodes into a single @graph — the ONLY place @context is set. */
export function generateGraphSchema(nodes: SchemaNode[]): SchemaNode {
  return { '@context': 'https://schema.org', '@graph': nodes }
}

/**
 * Site-wide entity graph injected ONCE in the root layout: Person + Organizations + WebSite.
 * Per the contract, pages must NOT re-emit these — a page emits only its own delta node(s)
 * (ProfilePage/WebPage/Breadcrumb/FAQ) via generateGraphSchema([...]), referencing #person by @id.
 */
export function defaultGraph(): SchemaNode {
  return generateGraphSchema([
    generatePersonSchema(),
    ...generateOrganizationSchemas(),
    generateWebSiteSchema(),
  ])
}

/* ---------------- Content-typed generators ---------------- */

/** FAQPage — Q&A format still aids AI extraction (rich result removed by Google, May 2026). */
export function generateFAQSchema(faqs: { question: string; answer: string }[]): SchemaNode {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

/** Article — for the Writing layer; author refs the Person. */
export function generateArticleSchema(opts: {
  title: string
  description: string
  url: string
  datePublished: string
  dateModified?: string
  image?: string
}): SchemaNode {
  return {
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    author: { '@id': ID.person() },
    publisher: { '@id': ID.person() },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    ...(opts.image ? { image: opts.image } : {}),
  }
}

/** ItemList — for hub pages (work index, etc.). */
export function generateItemListSchema(
  name: string,
  items: { name: string; url: string; description?: string }[],
): SchemaNode {
  return {
    '@type': 'ItemList',
    name,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url,
      ...(item.description ? { description: item.description } : {}),
    })),
  }
}

/** Map a portfolio Project to the right schema type (software products vs other creative work). */
export function generateProjectSchema(project: Project, url?: string): SchemaNode {
  const isSoftware = project.kind === 'ai-product' || project.kind === 'iot-platform'
  return {
    '@type': isSoftware ? 'SoftwareApplication' : 'CreativeWork',
    name: project.name,
    description: project.summary,
    ...(url ? { url } : project.url ? { url: project.url } : {}),
    ...(isSoftware ? { applicationCategory: 'BusinessApplication', operatingSystem: 'Web' } : {}),
    creator: { '@id': ID.person() },
    ...(project.stack ? { keywords: project.stack.join(', ') } : {}),
  }
}
