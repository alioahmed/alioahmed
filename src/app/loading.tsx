import { Section } from '@/components/ui/section'

export default function Loading() {
  return (
    <Section pad="lg" aria-busy="true" aria-live="polite">
      <div className="max-w-3xl animate-pulse space-y-5">
        <div className="bg-surface-2 h-6 w-48 rounded-[var(--radius-full)]" />
        <div className="bg-surface-2 h-14 w-2/3 rounded-[var(--radius-card)]" />
        <div className="bg-surface-2 h-6 w-full rounded-[var(--radius-card)]" />
        <div className="bg-surface-2 h-6 w-5/6 rounded-[var(--radius-card)]" />
      </div>
    </Section>
  )
}
