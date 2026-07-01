import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Cta } from '@/components/ui/cta'
import { MobileMenu } from '@/components/layout/mobile-menu'
import { SITE_CONFIG } from '@/lib/site'
import { NAV, PROFILES, PROFILE } from '@/lib/content'

/**
 * Header — production responsive: brand + inline nav/CTA on md+, an accessible hamburger drawer
 * on mobile. Sticky, safe-area aware (clears the notch). Nav auto-fills as routes go live.
 */
export function Header() {
  const contactHref = `mailto:${PROFILE.contact.email}`
  const profiles = PROFILES.map((p) => ({ key: p.key, label: p.label, url: p.url }))

  return (
    <header className="pt-safe border-hairline bg-canvas/80 sticky top-0 z-50 border-b backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          aria-label={`${SITE_CONFIG.name} — home`}
          className="text-ink font-mono text-sm font-semibold tracking-tight"
        >
          {SITE_CONFIG.name}
        </Link>

        {/* Desktop: inline nav + primary CTA */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV.length > 0 && (
            <nav aria-label="Primary" className="flex items-center gap-6 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted hover:text-ink transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
          <Cta href={contactHref} variant="accent">
            Get in touch
          </Cta>
        </div>

        {/* Mobile: accessible drawer */}
        <MobileMenu nav={NAV} contactHref={contactHref} profiles={profiles} />
      </Container>
    </header>
  )
}
