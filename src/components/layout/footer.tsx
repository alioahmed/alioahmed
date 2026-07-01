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
    <footer className="border-hairline bg-surface border-t">
      <Container className="grid gap-8 py-12 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-ink font-mono text-sm font-semibold">{SITE_CONFIG.name}</p>
          <p className="text-muted mt-1 text-sm">
            {SITE_CONFIG.title} · {SITE_CONFIG.location.display}
          </p>
          <nav aria-label="Profiles" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {PROFILES.map((p) => (
              <a
                key={p.key}
                href={p.url}
                target="_blank"
                rel="noreferrer noopener me"
                className="text-muted hover:text-ink transition-colors"
              >
                {p.label}
              </a>
            ))}
          </nav>
        </div>
        {FOOTER_LINKS.map((group) => (
          <nav key={group.heading} aria-label={group.heading} className="text-sm">
            <p className="text-faint font-mono text-[11px] tracking-[0.14em] uppercase">
              {group.heading}
            </p>
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
