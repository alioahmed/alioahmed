import type { Metadata } from 'next'
import Link from 'next/link'
import { createMetadata } from '@/lib/metadata'
import { absoluteUrl } from '@/lib/site'
import {
  AUDIENCES,
  BIO,
  CAPABILITIES,
  FAQS,
  FEATURED_CASE_STUDIES,
  HOME_COPY,
  OPEN_TO,
  PROFILE,
  PROFILES,
  STATS,
  TRUST_BAR,
  pageDates,
} from '@/lib/content'
import {
  generateFAQSchema,
  generateGraphSchema,
  generateProfilePageSchema,
} from '@/lib/schema'
import { JsonLd } from '@/components/seo/json-ld'
import { Section, SectionHeading } from '@/components/ui/section'
import { Card } from '@/components/ui/card'
import { Pill } from '@/components/ui/pill'
import { Cta } from '@/components/ui/cta'
import { StatTile } from '@/components/ui/stat-tile'
import { CaseStudyCard, FaqList } from '@/components/work/case-blocks'

export const metadata: Metadata = createMetadata({
  path: '/',
  description: HOME_COPY.seoDescription,
})

const dates = pageDates('/')

// The home IS the entity page → ProfilePage (mainEntity → #person) + the global FAQ set.
// The layout owns the Person/Org/WebSite entity graph; this is the page-scoped delta only.
const pageSchema = generateGraphSchema([
  generateProfilePageSchema({
    url: absoluteUrl('/'),
    datePublished: dates.published,
    dateModified: dates.modified,
  }),
  generateFAQSchema(FAQS),
])

const linkedin = PROFILES.find((p) => p.key === 'linkedin')?.url

export default function HomePage() {
  return (
    <>
      <JsonLd data={pageSchema} />

      {/* Hero — the 5-second identity + the answer capsule (BIO.standard, verbatim). */}
      <Section mesh pad="lg">
        <div className="max-w-3xl">
          <Pill variant="accent">{PROFILE.titleFull}</Pill>
          <h1 className="text-display-xxl text-ink mt-6">{PROFILE.name}</h1>
          <p className="text-lead text-muted mt-5 max-w-2xl">{PROFILE.oneLiner}</p>
          <p className="text-body mt-5 max-w-2xl">{BIO.standard}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Cta href={HOME_COPY.hero.ctaPrimary.href} variant="accent">
              {HOME_COPY.hero.ctaPrimary.label}
            </Cta>
            <Cta href={HOME_COPY.hero.ctaSecondary.href} variant="secondary">
              {HOME_COPY.hero.ctaSecondary.label}
            </Cta>
          </div>
          <p className="eyebrow text-faint mt-14">{HOME_COPY.hero.trustLabel}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {TRUST_BAR.map((name) => (
              <li key={name}>
                <Pill variant="outline">{name}</Pill>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Proof figures. */}
      <Section tone="surface" pad="md">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
          {STATS.map((s) => (
            <StatTile key={s.label} value={s.value} label={s.label} size={s.emphasis ? 'md' : 'sm'} />
          ))}
        </dl>
      </Section>

      {/* Capabilities — the ?-heading section. */}
      <Section>
        <SectionHeading
          eyebrow={HOME_COPY.capabilities.eyebrow}
          title={HOME_COPY.capabilities.title}
          lead={HOME_COPY.capabilities.lead}
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <Card key={c.title} pad="md" className="flex flex-col">
              <h3 className="text-heading-md text-ink">{c.title}</h3>
              <p className="text-muted mt-2 text-sm leading-relaxed">{c.description}</p>
              <ul className="mt-5 flex flex-wrap gap-1.5">
                {c.skills.map((skill) => (
                  <li key={skill}>
                    <Pill>{skill}</Pill>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      {/* Selected work. */}
      <Section tone="cream">
        <SectionHeading
          eyebrow={HOME_COPY.work.eyebrow}
          title={HOME_COPY.work.title}
          lead={HOME_COPY.work.lead}
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {FEATURED_CASE_STUDIES.map((cs, i) => (
            <CaseStudyCard key={cs.slug} cs={cs} variant={i === 0 ? 'featured' : 'feature'} />
          ))}
        </div>
        <p className="text-body mt-10 max-w-2xl">
          The deepest single build is{' '}
          <Link href="/work/paralegent" className="text-accent font-medium underline-offset-4 hover:underline">
            Paralegent AI
          </Link>{' '}
          — 18+ agents reviewing contracts against a customer’s own playbook.
        </p>
        <div className="mt-6">
          <Cta href={HOME_COPY.work.all.href} variant="secondary">
            {HOME_COPY.work.all.label}
          </Cta>
        </div>
      </Section>

      {/* Audiences. */}
      <Section>
        <SectionHeading
          eyebrow={HOME_COPY.audiences.eyebrow}
          title={HOME_COPY.audiences.title}
          lead={HOME_COPY.audiences.lead}
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {AUDIENCES.map((a) => (
            <Card key={a.slug} pad="md">
              <h3 className="text-heading-md text-ink">{a.title}</h3>
              <p className="text-muted mt-2 text-sm leading-relaxed">{a.pitch}</p>
            </Card>
          ))}
        </div>
        <div className="mt-10 max-w-2xl">
          <p className="eyebrow text-faint">Open to</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {OPEN_TO.regions.map((r) => (
              <li key={r}>
                <Pill variant="neutral">{r}</Pill>
              </li>
            ))}
          </ul>
          <p className="text-body mt-6">
            The full story — timeline, credentials, availability — is on the{' '}
            <Link href="/about" className="text-accent font-medium underline-offset-4 hover:underline">
              about page
            </Link>
            .
          </p>
        </div>
        <div className="mt-8">
          <Cta href="/contact" variant="accent">
            Get in touch
          </Cta>
        </div>
      </Section>

      {/* FAQ — five more ?-headings for answer engines. */}
      <Section tone="surface">
        <SectionHeading eyebrow={HOME_COPY.faq.eyebrow} title={HOME_COPY.faq.title} />
        <FaqList faqs={FAQS} className="mt-10" />
      </Section>

      {/* Closing band. */}
      <Section tone="dark">
        <SectionHeading
          eyebrow={HOME_COPY.closing.eyebrow}
          title={HOME_COPY.closing.title}
          lead={HOME_COPY.closing.lead}
          onDark
        />
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Cta href={`mailto:${PROFILE.contact.email}`} variant="accent">
            Email {PROFILE.firstName}
          </Cta>
          {linkedin && (
            <Cta href={linkedin} variant="dark" noArrow>
              Connect on LinkedIn
            </Cta>
          )}
        </div>
      </Section>
    </>
  )
}
