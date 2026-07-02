import * as React from 'react'
import { cn } from '@/lib/utils'
import { Container } from '@/components/ui/container'
import { GradientMesh } from '@/components/ui/gradient-mesh'

type Tone = 'canvas' | 'surface' | 'cream' | 'dark'
type Pad = 'lg' | 'md' | 'none'

const toneClass: Record<Tone, string> = {
  canvas: 'bg-canvas text-body',
  surface: 'bg-surface text-body',
  cream: 'bg-cream text-ink',
  dark: 'bg-brand-dark text-on-ink',
}

// Stripe marketing rhythm: generous section padding (~64–96px), tighter on compact bands.
const padClass: Record<Pad, string> = {
  lg: 'py-20 md:py-28',
  md: 'py-14 md:py-20',
  none: '',
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: Tone
  pad?: Pad
  /** Set false to render without the inner Container (full-bleed). */
  contain?: boolean
  /** Float the signature gradient-mesh backdrop behind the content (heroes). */
  mesh?: boolean
}

/** Section — the universal vertical-rhythm + tone wrapper. */
export function Section({
  tone = 'canvas',
  pad = 'lg',
  contain = true,
  mesh = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(toneClass[tone], padClass[pad], mesh && 'relative isolate', className)}
      {...props}
    >
      {mesh && (
        <GradientMesh className="absolute inset-x-0 top-0 -z-10 h-[clamp(22rem,60vh,40rem)]" />
      )}
      {contain ? <Container>{children}</Container> : children}
    </section>
  )
}

/** SectionHeading — eyebrow + H2 + lead, with on-dark colour flip. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  onDark = false,
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  lead?: React.ReactNode
  onDark?: boolean
  className?: string
}) {
  return (
    <div className={cn('max-w-2xl', className)}>
      {eyebrow && (
        <p className={cn('eyebrow mb-3', onDark ? 'text-accent-bright' : 'text-accent')}>
          {eyebrow}
        </p>
      )}
      <h2 className={cn('text-display-lg text-balance', onDark ? 'text-on-ink' : 'text-ink')}>
        {title}
      </h2>
      {lead && (
        <p className={cn('text-lead mt-4', onDark ? 'text-on-ink-muted' : 'text-muted')}>{lead}</p>
      )}
    </div>
  )
}
