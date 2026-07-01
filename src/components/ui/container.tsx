import * as React from 'react'
import { cn } from '@/lib/utils'

/** Container — the single max-width wrapper. Keeps horizontal rhythm consistent site-wide. */
export function Container({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mx-auto w-full max-w-[var(--container-max)] px-6', className)} {...props}>
      {children}
    </div>
  )
}
