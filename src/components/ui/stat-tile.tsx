import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'xl'

const valueSize: Record<Size, string> = {
  sm: 'text-2xl',
  md: 'text-3xl',
  xl: 'text-4xl md:text-5xl',
}

/** StatTile — a single proof figure with a label. Mono tabular figures. */
export function StatTile({
  value,
  label,
  size = 'md',
  onInk = false,
  rule = false,
  className,
}: {
  value: string
  label: string
  size?: Size
  onInk?: boolean
  rule?: boolean
  className?: string
}) {
  return (
    <div className={cn(rule && 'border-accent border-l-2 pl-4', className)}>
      <dd
        className={cn(
          'font-mono font-semibold tracking-tight tabular-nums',
          valueSize[size],
          onInk ? 'text-on-ink' : 'text-ink',
        )}
      >
        {value}
      </dd>
      <dt className={cn('mt-1 text-sm', onInk ? 'text-on-ink-muted' : 'text-muted')}>{label}</dt>
    </div>
  )
}
