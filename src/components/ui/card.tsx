import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Card — locked surface variants (docs/DESIGN.md). Compose, never restyle inline.
 * - feature: white, hairline border, radius-featured (the default content card)
 * - featured: inverted deep-navy tier (the brand's distinctive highlight)
 * - cream: warm interlude band
 * - mockup: product-UI composite chrome with a Level-2 lift
 */
const cardVariants = cva('rounded-[var(--radius-featured)]', {
  variants: {
    variant: {
      feature: 'border border-hairline bg-canvas text-body',
      featured: 'bg-brand-dark text-on-ink',
      cream: 'bg-cream text-ink',
      mockup: 'bg-canvas text-body shadow-[var(--shadow-level-3)]',
    },
    pad: {
      md: 'p-6',
      lg: 'p-8', // 32px — spec feature-card padding
    },
    hover: {
      true: 'transition-shadow duration-[var(--motion-base)] ease-[var(--ease-out)] hover:shadow-[var(--shadow-level-2)]',
      false: '',
    },
  },
  defaultVariants: { variant: 'feature', pad: 'lg', hover: false },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, pad, hover, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, pad, hover }), className)} {...props} />
}

export { cardVariants }
