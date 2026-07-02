import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createMetadata } from '@/lib/metadata'
import { absoluteUrl } from '@/lib/site'
import { CASE_STUDIES, getCaseStudy, getProject, pageDates } from '@/lib/content'
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateGraphSchema,
  generateProjectSchema,
  generateWebPageSchema,
} from '@/lib/schema'
import { JsonLd } from '@/components/seo/json-ld'
import { Section } from '@/components/ui/section'
import { Pill } from '@/components/ui/pill'
import { Cta } from '@/components/ui/cta'
import { StatTile } from '@/components/ui/stat-tile'
import { Card } from '@/components/ui/card'
import { CaseBlocks, CaseStatus, FaqList } from '@/components/work/case-blocks'

export function generateStaticParams() {
  return CASE_STUDIES.map((cs) => ({ slug: cs.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const cs = getCaseStudy(slug)
  if (!cs) return {}
  return createMetadata({
    path: `/work/${cs.slug}`,
    title: cs.seoTitle,
    description: cs.seoDescription,
  })
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cs = getCaseStudy(slug)
  if (!cs) notFound()

  const path = `/work/${cs.slug}`
  const url = absoluteUrl(path)
  const dates = pageDates(path)

  const pageSchema = generateGraphSchema([
    generateWebPageSchema({
      title: cs.seoTitle,
      description: cs.seoDescription,
      url,
      datePublished: dates.published,
      dateModified: dates.modified,
    }),
    generateBreadcrumbSchema([
      { name: 'Home', url: absoluteUrl('/') },
      { name: 'Work', url: absoluteUrl('/work') },
      { name: cs.title, url },
    ]),
    generateFAQSchema(cs.faqs),
    ...(cs.projectSlugs ?? [])
      .map((s) => getProject(s))
      .filter((p) => p !== undefined)
      .map((p) => generateProjectSchema(p, url)),
  ])

  const related = cs.related
    .map((r) => ({ ...r, cs: getCaseStudy(r.slug) }))
    .filter((r) => r.cs !== undefined)

  return (
    <>
      <JsonLd data={pageSchema} />

      {/* Hero — eyebrow, H1, role line, the answer capsule, and the proof figures. */}
      <Section mesh pad="md">
        <div className="max-w-3xl">
          <Link
            href="/work"
            className="text-muted hover:text-accent text-sm font-medium transition-colors"
          >
            ← All work
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Pill variant="accent">{cs.eyebrow}</Pill>
            <CaseStatus status={cs.status} />
          </div>
          <h1 className="text-display-xl text-ink mt-5">{cs.title}</h1>
          <p className="text-muted mt-3 text-sm font-medium">
            {cs.role} · {cs.dateLabel}
          </p>
          <p className="text-body mt-5 max-w-2xl">{cs.answerCapsule}</p>
          {cs.external && (
            <p className="mt-4 text-sm">
              <a
                href={cs.external.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-accent font-medium underline-offset-4 hover:underline"
              >
                {cs.external.label} ↗
              </a>
            </p>
          )}
        </div>
        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {cs.heroStats.map((s) => (
            <StatTile key={s.label} value={s.value} label={s.label} size="md" rule />
          ))}
        </dl>
      </Section>

      {/* Body — the question heading leads the narrative. */}
      <Section>
        <h2 className="text-display-lg text-ink max-w-2xl text-balance">{cs.questionHeading}</h2>
        <CaseBlocks sections={cs.sections} className="mt-10" />
      </Section>

      {/* Page-scoped Q&A. */}
      <Section tone="surface" pad="md">
        <h2 className="text-display-md text-ink">Questions about {cs.title}</h2>
        <FaqList faqs={cs.faqs} className="mt-8" />
      </Section>

      {/* Related + CTA. */}
      <Section pad="md">
        <p className="eyebrow text-faint">Keep reading</p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {related.map((r) => (
            <Card key={r.slug} pad="md" hover>
              <h3 className="text-heading-md text-ink">
                <Link
                  href={`/work/${r.slug}`}
                  className="hover:text-accent transition-colors"
                >
                  {r.label}
                </Link>
              </h3>
            </Card>
          ))}
        </div>
        <div className="mt-10">
          <Cta href="/contact" variant="accent">
            Work with Ali
          </Cta>
        </div>
      </Section>
    </>
  )
}
