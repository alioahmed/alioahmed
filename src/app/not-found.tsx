import { Section } from '@/components/ui/section'
import { Cta } from '@/components/ui/cta'

export default function NotFound() {
  return (
    <Section pad="lg">
      <div className="max-w-xl">
        <p className="text-accent font-mono text-[11px] tracking-[0.18em] uppercase">404</p>
        <h1 className="text-ink mt-4 text-4xl font-bold tracking-[-0.02em]">Page not found</h1>
        <p className="text-muted mt-4 text-lg">That page doesn’t exist or has moved.</p>
        <div className="mt-8">
          <Cta href="/" variant="ink">
            Back home
          </Cta>
        </div>
      </div>
    </Section>
  )
}
