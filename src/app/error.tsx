'use client'

import { useEffect } from 'react'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Section pad="lg">
      <div className="max-w-xl">
        <p className="eyebrow text-error">Error</p>
        <h1 className="text-display-lg text-ink mt-4">Something went wrong</h1>
        <p className="text-lead text-muted mt-4">An unexpected error occurred. Try again.</p>
        <div className="mt-8">
          <Button onClick={reset} variant="primary">
            Try again
          </Button>
        </div>
      </div>
    </Section>
  )
}
