import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { SITE_CONFIG } from '@/lib/site'
import { PROFILES, FOOTER_LINKS } from '@/lib/content'

/**
 * Footer — minimal shell. Renders the canonical profile links (the entity-fusion "find me
 * everywhere" set) plus the site nav. Real polish comes with the content phase.
 */
export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="pb-safe border-hairline bg-surface border-t">
      <Container className="grid gap-8 py-12 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-ink text-base font-semibold tracking-[-0.01em]">{SITE_CONFIG.name}</p>
          <p className="text-muted mt-1 text-sm">
            {SITE_CONFIG.title} · {SITE_CONFIG.location.display}
          </p>
          <nav
            aria-label="Profiles"
            className="mt-3 flex flex-wrap gap-x-1 gap-y-1 text-sm sm:mt-4"
          >
            {PROFILES.map((p) => (
              <a
                key={p.key}
                href={p.url}
                target="_blank"
                rel="noreferrer noopener me"
                className="text-muted hover:text-ink hover:bg-surface -mx-1 inline-flex min-h-9 min-w-11 items-center justify-center rounded-[var(--radius-sharp)] px-3 transition-colors"
              >
                {p.label}
              </a>
            ))}
          </nav>
        </div>
        {FOOTER_LINKS.map((group) => (
          <nav key={group.heading} aria-label={group.heading} className="text-sm">
            <p className="eyebrow text-faint">{group.heading}</p>
            <ul className="mt-3 space-y-2">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted hover:text-ink transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <Container className="pb-8">
        <p className="text-faint text-xs">
          © {year} {SITE_CONFIG.name}
        </p>
      </Container>
    </footer>
  )
}
