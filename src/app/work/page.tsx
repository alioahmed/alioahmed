import type { Metadata } from 'next'
import Link from 'next/link'
import { createMetadata } from '@/lib/metadata'
import { absoluteUrl } from '@/lib/site'
import { CASE_STUDIES, PROJECTS, WORK_COPY, getCaseStudy, pageDates } from '@/lib/content'
import {
  generateBreadcrumbSchema,
  generateGraphSchema,
  generateItemListSchema,
  generateWebPageSchema,
} from '@/lib/schema'
import { JsonLd } from '@/components/seo/json-ld'
import { Section, SectionHeading } from '@/components/ui/section'
import { Cta } from '@/components/ui/cta'
import { CaseStudyCard } from '@/components/work/case-blocks'

export const metadata: Metadata = createMetadata({
  path: '/work',
  title: WORK_COPY.seoTitle,
  description: WORK_COPY.seoDescription,
})

const dates = pageDates('/work')

const pageSchema = generateGraphSchema([
  generateWebPageSchema({
    title: WORK_COPY.seoTitle,
    description: WORK_COPY.seoDescription,
    url: absoluteUrl('/work'),
    datePublished: dates.published,
    dateModified: dates.modified,
    pageType: 'CollectionPage',
  }),
  generateBreadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Work', url: absoluteUrl('/work') },
  ]),
  generateItemListSchema(
    'Work — Ali Ahmed',
    CASE_STUDIES.map((cs) => ({
      name: cs.title,
      url: absoluteUrl(`/work/${cs.slug}`),
      description: cs.seoDescription,
    })),
  ),
])

/** Status labels for the portfolio table. */
const TABLE_STATUS: Record<string, string> = {
  production: 'In production',
  live: 'Live',
  'pre-launch': 'Pre-launch',
  shipped: 'Shipped',
  archived: 'Archived',
}

export default function WorkPage() {
  return (
    <>
      <JsonLd data={pageSchema} />

      <Section mesh pad="md">
        <div className="max-w-3xl">
          <h1 className="text-display-xl text-ink">{WORK_COPY.title}</h1>
          <p className="text-body mt-5 max-w-2xl">{WORK_COPY.capsule}</p>
        </div>
      </Section>

      <Section>
        <SectionHeading title={WORK_COPY.shipped.title} lead={WORK_COPY.shipped.lead} />
        <div className="mt-12 space-y-14">
          {WORK_COPY.groups.map((group) => {
            const studies = group.slugs
              .map((slug) => getCaseStudy(slug))
              .filter((cs) => cs !== undefined)
            return (
              <div key={group.key}>
                <p className="eyebrow text-faint">{group.title}</p>
                <ul className="mt-4 grid list-none gap-5 md:grid-cols-2">
                  {studies.map((cs) => (
                    <li key={cs.slug}>
                      <CaseStudyCard cs={cs} />
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </Section>

      {/* The portfolio table — the strongest AEO element on the site. */}
      <Section tone="surface">
        <SectionHeading
          eyebrow={WORK_COPY.table.eyebrow}
          title={WORK_COPY.table.title}
          lead={WORK_COPY.table.lead}
        />
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-hairline border-b text-left">
                {WORK_COPY.table.columns.map((col) => (
                  <th key={col} className="eyebrow text-faint py-3 pr-6 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROJECTS.map((p) => (
                <tr key={p.slug} className="border-hairline border-b">
                  <td className="text-ink py-3.5 pr-6 font-medium">{p.name}</td>
                  <td className="text-muted py-3.5 pr-6">{p.org}</td>
                  <td className="text-muted py-3.5 pr-6">{p.role}</td>
                  <td className="text-muted py-3.5 pr-6">{TABLE_STATUS[p.status] ?? p.status}</td>
                  <td className="text-ink py-3.5 tabular-nums">
                    {p.metrics?.[0] ? `${p.metrics[0].value} ${p.metrics[0].label}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section pad="md">
        <p className="text-body max-w-2xl">
          {WORK_COPY.closing.aboutLead}{' '}
          <Link href="/about" className="text-accent font-medium underline-offset-4 hover:underline">
            {WORK_COPY.closing.aboutLabel}
          </Link>
          .
        </p>
        <div className="mt-6">
          <Cta href="/contact" variant="accent">
            {WORK_COPY.closing.ctaLabel}
          </Cta>
        </div>
      </Section>
    </>
  )
}
