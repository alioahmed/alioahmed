import * as React from 'react'
import { cn } from '@/lib/utils'
import { Container } from '@/components/ui/container'

type Tone = 'canvas' | 'surface' | 'ink'
type Pad = 'lg' | 'md' | 'none'

const toneClass: Record<Tone, string> = {
  canvas: 'bg-canvas text-body',
  surface: 'bg-surface text-body',
  ink: 'bg-ink text-on-ink',
}

const padClass: Record<Pad, string> = {
  lg: 'py-24 md:py-32',
  md: 'py-16 md:py-20',
  none: '',
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: Tone
  pad?: Pad
  /** Set false to render without the inner Container (full-bleed). */
  contain?: boolean
}

/** Section — the universal vertical-rhythm + tone wrapper. */
export function Section({
  tone = 'canvas',
  pad = 'lg',
  contain = true,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn(toneClass[tone], padClass[pad], className)} {...props}>
      {contain ? <Container>{children}</Container> : children}
    </section>
  )
}

/** SectionHeading — eyebrow + H2 + lead, with on-ink color flip. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  onInk = false,
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  lead?: React.ReactNode
  onInk?: boolean
  className?: string
}) {
  return (
    <div className={cn('max-w-2xl', className)}>
      {eyebrow && (
        <p
          className={cn(
            'mb-3 font-mono text-[11px] tracking-[0.18em] uppercase',
            onInk ? 'text-accent-soft' : 'text-accent',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'text-3xl font-bold tracking-[-0.02em] text-balance md:text-4xl',
          onInk ? 'text-on-ink' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {lead && (
        <p className={cn('mt-4 text-lg', onInk ? 'text-on-ink-muted' : 'text-muted')}>{lead}</p>
      )}
    </div>
  )
}
