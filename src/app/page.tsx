import type { Metadata } from 'next'
import { createMetadata } from '@/lib/metadata'
import { absoluteUrl } from '@/lib/site'
import { PROFILE, PROFILES, pageDates } from '@/lib/content'
import { generateGraphSchema, generateProfilePageSchema } from '@/lib/schema'
import { JsonLd } from '@/components/seo/json-ld'
import { Section } from '@/components/ui/section'
import { Pill } from '@/components/ui/pill'
import { Cta } from '@/components/ui/cta'

export const metadata: Metadata = createMetadata({ path: '/' })

const dates = pageDates('/')

/**
 * Placeholder home — base + design-system scaffold. Renders just enough to build + validate the
 * SEO graph and demonstrate the Stripe-inspired token system end-to-end (mesh, type, pills).
 * The real content pages are designed and built later, with full context.
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

const linkedin = PROFILES.find((p) => p.key === 'linkedin')?.url

export default function HomePage() {
  return (
    <>
      <JsonLd data={pageSchema} />
      <Section mesh pad="lg">
        <div className="max-w-3xl">
          <Pill variant="accent">{PROFILE.titleFull}</Pill>
          <h1 className="text-display-xxl text-ink mt-6">{PROFILE.name}</h1>
          <p className="text-lead text-muted mt-5 max-w-2xl">{PROFILE.oneLiner}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Cta href={`mailto:${PROFILE.contact.email}`} variant="accent">
              Get in touch
            </Cta>
            {linkedin && (
              <Cta href={linkedin} variant="secondary" noArrow>
                Connect on LinkedIn
              </Cta>
            )}
          </div>
          <p className="eyebrow text-faint mt-14">Foundation in place · pages built later</p>
        </div>
      </Section>
    </>
  )
}
