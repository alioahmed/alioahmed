import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/** Pill — small mono-uppercase badge (eyebrows, status chips). */
const pillVariants = cva(
  'inline-flex items-center gap-1.5 rounded-[var(--radius-full)] font-mono text-[11px] uppercase tracking-[0.14em]',
  {
    variants: {
      variant: {
        accent: 'bg-accent-soft text-accent',
        neutral: 'bg-surface text-muted',
        outline: 'border border-hairline text-muted',
        live: 'bg-accent-soft text-accent',
      },
      size: {
        sm: 'px-2.5 py-1',
        md: 'px-3 py-1.5',
      },
    },
    defaultVariants: { variant: 'neutral', size: 'sm' },
  },
)

export interface PillProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof pillVariants> {}

export function Pill({ className, variant, size, children, ...props }: PillProps) {
  return (
    <span className={cn(pillVariants({ variant, size }), className)} {...props}>
      {variant === 'live' && (
        <span className="relative flex size-1.5">
          <span className="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
          <span className="bg-accent relative inline-flex size-1.5 rounded-full" />
        </span>
      )}
      {children}
    </span>
  )
}
