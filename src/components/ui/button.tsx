import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Button — locked variants. Compose, never restyle inline.
 * Motion is built in (subtle scale) and respects reduced-motion.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium',
    'rounded-[var(--radius-card)] transition-transform duration-[var(--motion-fast)] ease-[var(--ease-out)]',
    'hover:scale-[1.02] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-ink text-on-ink hover:bg-[#1c1f25]',
        accent: 'bg-accent text-accent-ink hover:bg-accent-hover',
        secondary: 'border border-hairline bg-canvas text-ink hover:bg-surface',
        ghost: 'text-ink hover:bg-surface',
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        // md/lg meet the 44px mobile touch-target minimum; sm is for dense desktop UIs only.
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11 rounded-[var(--radius-full)]',
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
