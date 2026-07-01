'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/types'

interface MobileMenuProps {
  nav: NavItem[]
  contactHref: string
  profiles: { key: string; label: string; url: string }[]
}

/**
 * MobileMenu — accessible hamburger + slide-over drawer for small screens.
 * Focus-trapped, Escape-to-close, backdrop click, body scroll-lock, safe-area aware.
 * Hidden on md+ (the header shows inline nav there).
 */
export function MobileMenu({ nav, contactHref, profiles }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  // Lock scroll + Escape + focus management while open. (Closing happens on link click, below.)
  useEffect(() => {
    if (!open) return
    const trigger = triggerRef.current // snapshot for focus-restore on cleanup
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last!.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first!.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    // Focus the first focusable in the panel.
    panelRef.current?.querySelector<HTMLElement>('a[href], button')?.focus()

    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
      trigger?.focus() // restore focus to the trigger on close
    }
  }, [open])

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        aria-haspopup="dialog"
        className="text-ink hover:bg-surface flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] transition-colors"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Menu">
          {/* backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="bg-ink/30 absolute inset-0 backdrop-blur-sm"
          />
          {/* panel */}
          <div
            ref={panelRef}
            id="mobile-menu-panel"
            className="pt-safe pb-safe bg-canvas border-hairline absolute inset-y-0 right-0 flex w-[min(20rem,86vw)] flex-col overflow-y-auto overscroll-contain border-l shadow-[var(--shadow-level-4)]"
          >
            <div className="px-gutter flex h-16 items-center justify-between">
              <span className="text-faint font-mono text-[11px] tracking-[0.14em] uppercase">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="text-ink hover:bg-surface flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] transition-colors"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            {nav.length > 0 && (
              <nav aria-label="Mobile" className="px-gutter flex flex-col gap-1 py-2">
                {nav.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex min-h-11 items-center rounded-[var(--radius-card)] px-3 text-lg font-medium transition-colors',
                        active ? 'text-ink bg-surface' : 'text-body hover:bg-surface',
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            )}

            <div className="px-gutter mt-auto flex flex-col gap-4 py-6">
              <a
                href={contactHref}
                onClick={() => setOpen(false)}
                className="bg-accent text-accent-ink hover:bg-accent-hover flex min-h-11 items-center justify-center rounded-[var(--radius-full)] px-5 text-sm font-medium transition-colors"
              >
                Get in touch
              </a>
              <div className="-mx-2 flex flex-wrap gap-x-1 gap-y-1">
                {profiles.map((p) => (
                  <a
                    key={p.key}
                    href={p.url}
                    target="_blank"
                    rel="noreferrer noopener me"
                    className="text-muted hover:text-ink hover:bg-surface inline-flex min-h-9 min-w-11 items-center justify-center rounded-[var(--radius-sharp)] px-3 text-sm transition-colors"
                  >
                    {p.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
