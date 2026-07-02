/**
 * Case study — Build Buy Software. Compiled from canonical/P2-build-buy-software.md §3–§7.
 * Guardrails: title LOCKED "Product & Editorial Lead" (never founder/CEO/C-level); PRE-LAUNCH —
 * never "running a successful directory"; no invented scale (420 is the number); no Cognilium
 * affiliation claim (publicly independent); no hype vocabulary; built end-to-end (never "solo").
 */

import type { CaseStudy } from '@/lib/types'

export const BUILD_BUY_SOFTWARE: CaseStudy = {
  slug: 'build-buy-software',
  eyebrow: 'Independent venture · Legal tech',
  title: 'Build Buy Software',
  seoTitle: 'Build Buy Software — 420 legal-tech products, one published scoring formula',
  seoDescription:
    'Build Buy Software: an independent legal-tech directory Ali Ahmed built end-to-end — 420 ' +
    'products scored by a published, unbuyable formula. Pre-launch.',
  role: 'Product & Editorial Lead',
  dateLabel: 'May 2026 – present',
  status: 'pre-launch',
  answerCapsule:
    'Build Buy Software is an independent directory of 420 legal-technology products, each ' +
    'scored by a published, unbuyable formula. Ali Ahmed built it end-to-end — the product, the ' +
    'data model, the scoring methodology, roughly 2,000 pages, and the quality gate that fails ' +
    'the build on any editorial violation. It is currently pre-launch.',
  questionHeading: 'What makes the BBS Score different?',
  heroStats: [
    { value: '420', label: 'products across 10 categories' },
    { value: '387', label: 'vendors in the directory' },
    { value: '~2,000', label: 'statically generated pages' },
    { value: '27', label: 'published, DB-verified articles' },
  ],
  sections: [
    {
      kind: 'text',
      paras: [
        'The incumbent legal-tech directory ranks products with an unexplained black box. Build ' +
          'Buy Software was built as the structural opposite: the BBS Score is a 0–100 formula ' +
          'with published weights, computed from public evidence only — and it is unbuyable. ' +
          'Sponsorship appears in zero ranking queries; paid placement cannot touch a score.',
      ],
    },
    {
      kind: 'bullets',
      heading: 'Built like a data product, not a listicle',
      items: [
        'Provenance fields on every product, and figure re-verification after every data ' +
          'change — 27 published articles in which every statistic is computed from the ' +
          'database itself.',
        'A State of Legal Tech 2026 report (plus generated PDF) computed live from the ' +
          'directory’s own data, and a 48-prompt legal-AI prompt library.',
        'A CI quality gate that fails the build on hype vocabulary or editorial violations.',
        'Strategy grounded in a 20-track, adversarially-verified research program.',
      ],
    },
    {
      kind: 'text',
      heading: 'Where it sits in the story',
      paras: [
        'Ali is Product & Editorial Lead: he directs the product and bylines its data-analysis ' +
          'articles. The credibility hook is earned, not claimed — he previously led product on ' +
          'Paralegent AI, so the directory’s analysis of the legal-AI market comes from someone ' +
          'who has actually built in it. The venture is pre-launch: built, content-complete, ' +
          'and verified on a private preview, with the domain decided but not yet live.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Is Build Buy Software live?',
      answer:
        'Not yet — it is pre-launch. The product is built and content-complete on a private ' +
        'preview: 420 products, ~2,000 statically generated pages, and 27 published analyses, ' +
        'with the domain decided and launch pending.',
    },
    {
      question: 'Who is behind Build Buy Software?',
      answer:
        'Ali Ahmed is its Product & Editorial Lead — he built the directory end-to-end and ' +
        'bylines its data-analysis articles. The directory is independent, and its credibility ' +
        'rests on data methodology, not legal practice.',
    },
  ],
  related: [
    { slug: 'paralegent', label: 'Paralegent AI — the legal-AI product that came first' },
    { slug: 'cognilium', label: 'Cognilium AI — four AI products in production' },
  ],
  projectSlugs: ['build-buy-software'],
}
