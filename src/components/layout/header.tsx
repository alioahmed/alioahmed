import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { SITE_CONFIG } from '@/lib/site'

/**
 * Header — minimal shell for the base. Real navigation is added with the content pages.
 */
export function Header() {
  return (
    <header className="border-hairline bg-canvas/80 sticky top-0 z-50 border-b backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-ink font-mono text-sm font-semibold tracking-tight"
          aria-label={`${SITE_CONFIG.name} — home`}
        >
          {SITE_CONFIG.name}
        </Link>
        <nav aria-label="Primary" className="text-muted text-sm">
          {/* nav links added in the content phase */}
          <span className="text-faint font-mono text-[11px] tracking-[0.14em] uppercase">
            {SITE_CONFIG.title}
          </span>
        </nav>
      </Container>
    </header>
  )
}
