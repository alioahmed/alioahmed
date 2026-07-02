/**
 * Case-study renderers — turn the typed CaseBlock/CaseStudy content into the design system.
 * Server components; compose primitives only (no inline restyling of primitives).
 */

import Link from 'next/link'
import type { CaseBlock, CaseStudy } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Pill } from '@/components/ui/pill'
import { StatTile } from '@/components/ui/stat-tile'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<NonNullable<CaseStudy['status']>, string> = {
  live: 'Live',
  production: 'In production',
  'pre-launch': 'Pre-launch',
  concluded: 'Concluded',
}

/** Status chip for a case study. */
export function CaseStatus({ status }: { status?: CaseStudy['status'] }) {
  if (!status) return null
  const live = status === 'live' || status === 'production'
  return <Pill variant={live ? 'live' : 'outline'}>{STATUS_LABEL[status]}</Pill>
}

function BlockHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-heading-lg text-ink">{children}</h3>
}

/** One content block. */
function Block({ block }: { block: CaseBlock }) {
  switch (block.kind) {
    case 'text':
      return (
        <div className="max-w-2xl space-y-4">
          {block.heading && <BlockHeading>{block.heading}</BlockHeading>}
          {block.paras.map((p) => (
            <p key={p.slice(0, 40)} className="text-body">
              {p}
            </p>
          ))}
        </div>
      )
    case 'bullets':
      return (
        <div className="max-w-2xl space-y-4">
          {block.heading && <BlockHeading>{block.heading}</BlockHeading>}
          {block.intro && <p className="text-body">{block.intro}</p>}
          <ul className="space-y-3">
            {block.items.map((item) => (
              <li key={item.slice(0, 40)} className="flex gap-3">
                <span aria-hidden className="bg-accent mt-2.5 size-1.5 shrink-0 rounded-full" />
                <span className="text-body">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    case 'stats':
      return (
        <div className="space-y-6">
          {block.heading && <BlockHeading>{block.heading}</BlockHeading>}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            {block.stats.map((s) => (
              <StatTile key={s.label} value={s.value} label={s.label} size="md" />
            ))}
          </dl>
        </div>
      )
    case 'cards':
      return (
        <div className="space-y-6">
          {block.heading && <BlockHeading>{block.heading}</BlockHeading>}
          <div className="grid gap-5 md:grid-cols-2">
            {block.cards.map((card) => (
              <Card key={card.title} pad="md" hover={Boolean(card.href)}>
                <h4 className="text-heading-md text-ink">
                  {card.href ? (
                    <Link href={card.href} className="hover:text-accent transition-colors">
                      {card.title}
                    </Link>
                  ) : (
                    card.title
                  )}
                </h4>
                <p className="text-muted mt-2 text-sm leading-relaxed">{card.body}</p>
                {card.bullets && (
                  <ul className="mt-4 space-y-2">
                    {card.bullets.map((b) => (
                      <li key={b.slice(0, 40)} className="flex gap-2.5 text-sm">
                        <span
                          aria-hidden
                          className="bg-accent mt-2 size-1 shrink-0 rounded-full"
                        />
                        <span className="text-muted">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        </div>
      )
  }
}

/** The full section stack of a case study. */
export function CaseBlocks({ sections, className }: { sections: CaseBlock[]; className?: string }) {
  return (
    <div className={cn('space-y-14', className)}>
      {sections.map((block, i) => (
        <Block key={block.heading ?? block.kind + i} block={block} />
      ))}
    </div>
  )
}

/** Q&A block — the answer-engine format (h3 question + answer paragraph). */
export function FaqList({
  faqs,
  className,
}: {
  faqs: { question: string; answer: string }[]
  className?: string
}) {
  return (
    <div className={cn('max-w-2xl space-y-8', className)}>
      {faqs.map((f) => (
        <div key={f.question}>
          <h3 className="text-heading-md text-ink">{f.question}</h3>
          <p className="text-muted mt-2">{f.answer}</p>
        </div>
      ))}
    </div>
  )
}

/** Listing card for a case study (used on /work and the home page). */
export function CaseStudyCard({
  cs,
  variant = 'feature',
}: {
  cs: CaseStudy
  variant?: 'feature' | 'featured'
}) {
  const onDark = variant === 'featured'
  return (
    <Card variant={variant} pad="md" hover className="flex h-full flex-col">
      <p className={cn('eyebrow', onDark ? 'text-accent-bright' : 'text-accent')}>{cs.eyebrow}</p>
      <h3 className={cn('text-heading-lg mt-3', onDark ? 'text-on-ink' : 'text-ink')}>
        <Link
          href={`/work/${cs.slug}`}
          className={cn('transition-colors', onDark ? 'hover:text-accent-bright' : 'hover:text-accent')}
        >
          {cs.title}
        </Link>
      </h3>
      <p className={cn('mt-2 text-sm leading-relaxed', onDark ? 'text-on-ink-muted' : 'text-muted')}>
        {cs.seoDescription}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-4">
        {cs.heroStats.slice(0, 2).map((s) => (
          <StatTile key={s.label} value={s.value} label={s.label} size="sm" onDark={onDark} />
        ))}
      </dl>
      <div className="mt-auto pt-5">
        <Link
          href={`/work/${cs.slug}`}
          className={cn(
            'text-sm font-medium underline-offset-4 hover:underline',
            onDark ? 'text-accent-bright' : 'text-accent',
          )}
        >
          Read the case study
        </Link>
      </div>
    </Card>
  )
}
