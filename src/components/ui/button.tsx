import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Button — locked variants (Stripe pill system). Compose, never restyle inline.
 * Pill geometry (rounded-full), indigo-primary CTA hierarchy, blue-tinted lift on the
 * filled variant. Motion is a subtle scale that respects reduced-motion.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium',
    'rounded-[var(--radius-full)] transition-[transform,background-color,box-shadow]',
    'duration-[var(--motion-fast)] ease-[var(--ease-out)]',
    'hover:scale-[1.02] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        // The dominant CTA — one filled indigo pill per band.
        primary:
          'bg-accent text-accent-ink shadow-[var(--shadow-level-1)] hover:bg-accent-hover active:bg-accent-press',
        // Outline alternative on light surfaces.
        secondary: 'border border-accent bg-canvas text-accent hover:bg-accent-soft',
        // Neutral outline (for less-emphatic pairs).
        outline: 'border border-hairline bg-canvas text-ink hover:bg-surface',
        // On dark/navy shells.
        dark: 'bg-brand-dark text-on-ink hover:bg-ink',
        ghost: 'text-ink hover:bg-surface',
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        // md/lg meet the 44px mobile touch-target minimum; sm is for dense desktop UIs only.
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { buttonVariants }
