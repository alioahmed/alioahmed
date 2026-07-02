import type { Metadata } from 'next'
import Link from 'next/link'
import { createMetadata } from '@/lib/metadata'
import { absoluteUrl } from '@/lib/site'
import {
  AUDIENCES,
  CONTACT_COPY,
  CONTACT_FAQS,
  OPEN_TO,
  PROFILE,
  PROFILES,
  pageDates,
} from '@/lib/content'
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateGraphSchema,
  generateWebPageSchema,
} from '@/lib/schema'
import { JsonLd } from '@/components/seo/json-ld'
import { Section, SectionHeading } from '@/components/ui/section'
import { Pill } from '@/components/ui/pill'
import { Cta } from '@/components/ui/cta'
import { Card } from '@/components/ui/card'
import { FaqList } from '@/components/work/case-blocks'

export const metadata: Metadata = createMetadata({
  path: '/contact',
  title: CONTACT_COPY.seoTitle,
  description: CONTACT_COPY.seoDescription,
})

const dates = pageDates('/contact')

const pageSchema = generateGraphSchema([
  generateWebPageSchema({
    title: CONTACT_COPY.seoTitle,
    description: CONTACT_COPY.seoDescription,
    url: absoluteUrl('/contact'),
    datePublished: dates.published,
    dateModified: dates.modified,
    pageType: 'ContactPage',
  }),
  generateBreadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Contact', url: absoluteUrl('/contact') },
  ]),
  generateFAQSchema(CONTACT_FAQS),
])

/** Contact channels — email + WhatsApp link + socials (raw phone number is never printed). */
const CHANNELS: { label: string; value: string; href: string }[] = [
  {
    label: 'Email (fastest)',
    value: PROFILE.contact.email,
    href: `mailto:${PROFILE.contact.email}`,
  },
  {
    label: 'Say hello',
    value: PROFILE.contact.emailGeneral,
    href: `mailto:${PROFILE.contact.emailGeneral}`,
  },
  {
    label: 'WhatsApp',
    value: 'Open a chat',
    href: `https://wa.me/${PROFILE.contact.whatsapp.replace('+', '')}`,
  },
  ...PROFILES.filter((p) => p.key === 'linkedin' || p.key === 'x').map((p) => ({
    label: p.label,
    value: p.handle ? `@${p.handle}` : p.label,
    href: p.url,
  })),
]

export default function ContactPage() {
  return (
    <>
      <JsonLd data={pageSchema} />

      <Section mesh pad="md">
        <div className="max-w-3xl">
          <h1 className="text-display-xl text-ink">{CONTACT_COPY.title}</h1>
          <p className="text-body mt-5 max-w-2xl">{CONTACT_COPY.capsule}</p>
        </div>
      </Section>

      <Section pad="md">
        <SectionHeading title={CONTACT_COPY.channels.title} lead={CONTACT_COPY.channels.lead} />
        <ul className="mt-10 max-w-xl space-y-4">
          {CHANNELS.map((ch) => (
            <li key={ch.label} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="eyebrow text-faint w-32 shrink-0">{ch.label}</span>
              <a
                href={ch.href}
                {...(/^https?:\/\//.test(ch.href)
                  ? { target: '_blank', rel: 'noreferrer noopener' }
                  : {})}
                className="text-accent font-medium underline-offset-4 hover:underline"
              >
                {ch.value}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <Cta href={`mailto:${PROFILE.contact.email}`} variant="accent">
            {CONTACT_COPY.channels.ctaLabel}
          </Cta>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow={CONTACT_COPY.audiences.eyebrow}
          title={CONTACT_COPY.audiences.title}
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
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
          <p className="text-body mt-6 text-sm">
            {CONTACT_COPY.audiences.workLead}{' '}
            <Link href="/work" className="text-accent font-medium underline-offset-4 hover:underline">
              {CONTACT_COPY.audiences.workLabel}
            </Link>{' '}
            —{' '}
            <Link href="/about" className="text-accent font-medium underline-offset-4 hover:underline">
              {CONTACT_COPY.audiences.aboutLabel}
            </Link>
            .
          </p>
        </div>
      </Section>

      <Section pad="md">
        <h2 className="text-display-md text-ink">{CONTACT_COPY.faqTitle}</h2>
        <FaqList faqs={CONTACT_FAQS} className="mt-8" />
      </Section>
    </>
  )
}
