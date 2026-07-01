import type { Metadata } from 'next'
import { createMetadata } from '@/lib/metadata'
import { absoluteUrl } from '@/lib/site'
import { PROFILE, pageDates } from '@/lib/content'
import { generateGraphSchema, generateProfilePageSchema } from '@/lib/schema'
import { JsonLd } from '@/components/seo/json-ld'
import { Section } from '@/components/ui/section'
import { Pill } from '@/components/ui/pill'

export const metadata: Metadata = createMetadata({ path: '/' })

const dates = pageDates('/')

/**
 * Placeholder home — base scaffold only. Renders just enough to build + validate the SEO graph.
 * The real pages are designed and built later, with full context.
 */
// The home IS the entity page → emit ProfilePage (mainEntity → #person). The layout owns the
// Person/Org/WebSite entity graph; this is the page-scoped delta only.
const pageSchema = generateGraphSchema([
  generateProfilePageSchema({
    url: absoluteUrl('/'),
    datePublished: dates.published,
    dateModified: dates.modified,
  }),
])

export default function HomePage() {
  return (
    <>
      <JsonLd data={pageSchema} />
      <Section pad="lg">
        <div className="max-w-3xl">
          <Pill variant="accent">{PROFILE.titleFull}</Pill>
          <h1 className="text-ink mt-6 text-5xl font-extrabold tracking-[-0.03em] md:text-6xl">
            {PROFILE.name}
          </h1>
          <p className="text-muted mt-4 text-lg">{PROFILE.oneLiner}</p>
          <p className="text-faint mt-10 font-mono text-[11px] tracking-[0.18em] uppercase">
            Foundation in place · pages built later
          </p>
        </div>
      </Section>
    </>
  )
}
