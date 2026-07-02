import type { Metadata } from 'next'
import Link from 'next/link'
import { createMetadata } from '@/lib/metadata'
import { absoluteUrl } from '@/lib/site'
import {
  ABOUT_COPY,
  AWARDS,
  BIO,
  CAPABILITIES,
  EDUCATION,
  EXPERIENCE,
  INSTITUTIONS,
  OPEN_TO,
  PROFILE,
  pageDates,
} from '@/lib/content'
import {
  generateBreadcrumbSchema,
  generateGraphSchema,
  generateWebPageSchema,
} from '@/lib/schema'
import { JsonLd } from '@/components/seo/json-ld'
import { Section, SectionHeading } from '@/components/ui/section'
import { Pill } from '@/components/ui/pill'
import { Cta } from '@/components/ui/cta'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = createMetadata({
  path: '/about',
  title: ABOUT_COPY.seoTitle,
  description: ABOUT_COPY.seoDescription,
})

const dates = pageDates('/about')

// The home page owns the fixed #profilepage node — about emits an AboutPage delta only.
const pageSchema = generateGraphSchema([
  generateWebPageSchema({
    title: ABOUT_COPY.seoTitle,
    description: ABOUT_COPY.seoDescription,
    url: absoluteUrl('/about'),
    datePublished: dates.published,
    dateModified: dates.modified,
    pageType: 'AboutPage',
  }),
  generateBreadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'About', url: absoluteUrl('/about') },
  ]),
])

/** Case-study links for timeline entries that have a deep-dive page. */
const TIMELINE_LINKS: Record<string, string> = {
  cognilium: '/work/cognilium',
  'bijli-bachao': '/work/bijli-bachao',
  'wonder-women': '/work/wonder-women',
  'circle-gates': '/work/circle-gates',
  id92: '/work/startup-ecosystem',
}

export default function AboutPage() {
  return (
    <>
      <JsonLd data={pageSchema} />

      <Section mesh pad="md">
        <div className="max-w-3xl">
          <h1 className="text-display-xl text-ink">{ABOUT_COPY.title}</h1>
          <p className="text-body mt-5 max-w-2xl">{ABOUT_COPY.capsule}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Pill variant="accent">{PROFILE.location.display}</Pill>
            <Pill variant="outline">Open to remote-global & relocation</Pill>
          </div>
        </div>
      </Section>

      {/* The long bio, verbatim. */}
      <Section pad="md">
        <SectionHeading eyebrow={ABOUT_COPY.bio.eyebrow} title={ABOUT_COPY.bio.title} />
        <p className="text-body mt-8 max-w-2xl leading-relaxed">{BIO.long}</p>
      </Section>

      {/* Timeline — the ?-heading section. */}
      <Section tone="surface">
        <SectionHeading
          eyebrow={ABOUT_COPY.timeline.eyebrow}
          title={ABOUT_COPY.timeline.title}
          lead={ABOUT_COPY.timeline.lead}
        />
        <ol className="mt-12 max-w-3xl space-y-10">
          {EXPERIENCE.map((e) => {
            const href = TIMELINE_LINKS[e.slug]
            return (
              <li key={e.slug} className="border-hairline border-l-2 pl-6">
                <p className="eyebrow text-faint">{e.dateLabel}</p>
                <h3 className="text-heading-lg text-ink mt-2">
                  {e.role} · {e.org}
                </h3>
                <p className="text-muted mt-2 max-w-2xl">{e.summary}</p>
                {e.metrics && e.metrics.length > 0 && (
                  <p className="text-ink mt-3 text-sm font-medium tabular-nums">
                    {e.metrics.map((m) => `${m.value} ${m.label}`).join(' · ')}
                  </p>
                )}
                {href && (
                  <p className="mt-3 text-sm">
                    <Link
                      href={href}
                      className="text-accent font-medium underline-offset-4 hover:underline"
                    >
                      Read the case study
                    </Link>
                  </p>
                )}
              </li>
            )
          })}
        </ol>
      </Section>

      {/* Capabilities, education, awards, institutions. */}
      <Section>
        <SectionHeading
          eyebrow={ABOUT_COPY.credentials.eyebrow}
          title={ABOUT_COPY.credentials.title}
        />
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            {CAPABILITIES.map((c) => (
              <div key={c.title}>
                <h3 className="text-heading-md text-ink">{c.title}</h3>
                <p className="text-muted mt-2 text-sm leading-relaxed">{c.description}</p>
              </div>
            ))}
            <div>
              <h3 className="text-heading-md text-ink">Education</h3>
              {EDUCATION.map((e) => (
                <p key={e.degree} className="text-muted mt-2 text-sm">
                  {e.degree}, {e.institution} ({e.year})
                </p>
              ))}
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-heading-md text-ink">Awards & grants</h3>
              <ul className="mt-4 space-y-3">
                {AWARDS.map((a) => (
                  <li key={a.name} className="flex gap-3">
                    <span aria-hidden className="bg-accent mt-2.5 size-1.5 shrink-0 rounded-full" />
                    <span className="text-body text-sm">
                      {a.name}
                      {a.detail ? ` — ${a.detail}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-heading-md text-ink">Institutional trust</h3>
              <ul className="mt-4 space-y-3">
                {INSTITUTIONS.map((i) => (
                  <li key={i.name} className="flex gap-3">
                    <span aria-hidden className="bg-accent mt-2.5 size-1.5 shrink-0 rounded-full" />
                    <span className="text-body text-sm">
                      <span className="text-ink font-medium">{i.name}</span> — {i.relationship}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Availability — the recruiter block. */}
      <Section tone="cream">
        <SectionHeading
          eyebrow={ABOUT_COPY.availability.eyebrow}
          title={ABOUT_COPY.availability.title}
          lead={ABOUT_COPY.availability.lead}
        />
        <div className="mt-10 grid max-w-3xl gap-8 md:grid-cols-2">
          <div>
            <p className="eyebrow text-faint">Engagement</p>
            <ul className="mt-3 space-y-2">
              {OPEN_TO.modes.map((m) => (
                <li key={m} className="text-body text-sm">
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-faint">Regions</p>
            <ul className="mt-3 space-y-2">
              {OPEN_TO.regions.map((r) => (
                <li key={r} className="text-body text-sm">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Cta href="/contact" variant="accent">
            {ABOUT_COPY.availability.ctaLabel}
          </Cta>
          <p className="text-body text-sm">
            {ABOUT_COPY.availability.workLead}{' '}
            <Link href="/work" className="text-accent font-medium underline-offset-4 hover:underline">
              {ABOUT_COPY.availability.workLabel}
            </Link>
            .
          </p>
        </div>
      </Section>

      {/* Human-side hook — content arrives later. */}
      <Section pad="md">
        <Card variant="cream" pad="md" className="max-w-2xl">
          <p className="eyebrow text-faint">{ABOUT_COPY.beyondWork.eyebrow}</p>
          <p className="text-body mt-3">{ABOUT_COPY.beyondWork.line}</p>
        </Card>
      </Section>
    </>
  )
}
