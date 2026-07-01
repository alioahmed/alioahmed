import { Section } from '@/components/ui/section'
import { Cta } from '@/components/ui/cta'

export default function NotFound() {
  return (
    <Section pad="lg">
      <div className="max-w-xl">
        <p className="eyebrow text-accent">404</p>
        <h1 className="text-display-lg text-ink mt-4">Page not found</h1>
        <p className="text-lead text-muted mt-4">That page doesn’t exist or has moved.</p>
        <div className="mt-8">
          <Cta href="/" variant="accent">
            Back home
          </Cta>
        </div>
      </div>
    </Section>
  )
}
