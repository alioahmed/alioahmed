import * as React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Cta — pill-shaped call-to-action link with a built-in arrow. Renders next/link for internal
 * hrefs and a plain anchor for external ones. The arrow nudges on hover.
 */
const ctaVariants = cva(
  [
    'group inline-flex items-center gap-2 font-medium rounded-[var(--radius-full)]',
    'transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out)]',
  ],
  {
    variants: {
      variant: {
        accent: 'bg-accent text-accent-ink hover:bg-accent-hover',
        ink: 'bg-ink text-on-ink hover:bg-[#1c1f25]',
        outline: 'border border-hairline text-ink hover:bg-surface',
      },
      size: {
        // Both meet the 44px mobile touch-target minimum.
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'accent', size: 'md' },
  },
)

export interface CtaProps extends VariantProps<typeof ctaVariants> {
  href: string
  children: React.ReactNode
  className?: string
  /** Hide the trailing arrow. */
  noArrow?: boolean
}

export function Cta({ href, children, className, variant, size, noArrow }: CtaProps) {
  const classes = cn(ctaVariants({ variant, size }), className)
  const inner = (
    <>
      {children}
      {!noArrow && (
        <ArrowRight className="size-4 transition-transform duration-[var(--motion-fast)] group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" />
      )}
    </>
  )

  const isExternal = /^https?:\/\//.test(href)
  if (isExternal) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer noopener">
        {inner}
      </a>
    )
  }
  return (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  )
}
