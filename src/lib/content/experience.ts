/**
 * EXPERIENCE — the career spine. Sourced from the Mudassir-reviewed canonicals (01–08).
 *
 * GUARDRAILS baked in: roles are LOCKED titles. Never "Founder/CEO of Cognilium" (Mudassir's).
 * Wonder Women = dates only, no exit reason. Bijli Bachao megawatts capped at "~3 MW and growing".
 * CIRCLE/UNIDO = "trusted to deliver / backed by", never "worked at Gates" or "presented on stage".
 * GIZ = credibility anchor, no invented metrics. No "solo" framing anywhere.
 */

import type { Experience } from '@/lib/types'

export const EXPERIENCE: Experience[] = [
  {
    slug: 'cognilium',
    org: 'Cognilium AI',
    orgUrl: 'https://cognilium.ai',
    role: 'AI Solutions Engineer',
    kind: 'operator',
    start: '2024-09',
    end: 'present',
    dateLabel: 'Sept 2024 – present',
    location: 'Remote · US & UAE clients',
    tense: 'present',
    summary:
      'The operator who built the commercial machine of an AI engineering firm — and shipped its products.',
    highlights: [
      'Took four AI products idea → production: Paralegent (agentic legal AI), VORTA (enterprise RAG), ProspectVox (voice sales AI), and VectorHire (AI recruitment).',
      'Coded two production websites end-to-end (Next.js/React/TypeScript) plus a production Chrome extension.',
      'Built the growth engine from zero — Upwork strategy, a 6-domain cold-email stack, and outreach that brought in USD 50,000+ in client value.',
      'Stood up HR from scratch and ran finance, banking, and PSEB / IT-export compliance.',
    ],
    metrics: [
      { value: '4', label: 'AI products to production' },
      { value: 'USD 50K+', label: 'client value generated' },
    ],
    tags: ['LLM', 'RAG', 'AI agents', 'Product', 'Go-to-market'],
    featured: true,
  },
  {
    slug: 'bijli-bachao',
    org: 'Bijli Bachao',
    orgUrl: 'https://bijlibachao.pk',
    role: 'Head of Product & Platforms',
    kind: 'operator',
    start: '2025-10',
    end: 'present',
    dateLabel: 'Oct 2025 – present',
    location: 'Pakistan',
    tense: 'present',
    summary:
      'Designed, built, and owns three live SaaS/IoT platforms covering Pakistan’s commercial-energy lifecycle — built to international IEC engineering standards.',
    highlights: [
      'Wattey — real-time IoT electricity monitoring (~1.04 GWh tracked across 22 meters in 8 sectors).',
      'Solar Performance Cloud — independent multi-brand, string-level solar monitoring (56 sites · 70 inverters · 698 PV strings · 785 MWh tracked).',
      'TenantBill — OCR-verified multi-tenant billing, live in a real mall (74 tenants · 469 meters).',
      'Running real Pakistani factories, solar plants, and shopping malls — ~3 MW and growing. Founded by Engr. Reyyan Niaz Khan, an energy-sector pioneer.',
    ],
    metrics: [
      { value: '3', label: 'live IoT platforms' },
      { value: '~3 MW', label: 'and growing' },
    ],
    trustedBy: [],
    tags: ['IoT', 'SaaS', 'Energy', 'Product'],
    featured: true,
  },
  {
    slug: 'unido-paidar',
    org: 'UNIDO PAIDAR Programme',
    role: 'Head of Outreach & Ecosystem Engagement',
    kind: 'institutional',
    start: '2025-12',
    end: '2026-04',
    dateLabel: 'Dec 2025 – Apr 2026',
    location: 'Pakistan · via Digitara',
    tense: 'past',
    summary:
      'Turned an unknown UN grant programme into a room full of Pakistan’s top founders — in 9 days, with no budget.',
    highlights: [
      'Assembled Pakistan’s startup elite into one room on the strength of an 8-year network.',
      'Secured Fiza Farhan (UN Secretary-General’s panel, Forbes 30 Under 30) on keynote, plus founders of Bookme, Interwood, ORA Global, Bramerz, and Amal Academy on stage.',
      'Mobilised 70+ founders & CEOs (Bykea, Marham, Edkasa, Kistpay…) to attend — engaged via Digitara on the UNIDO PAIDAR Programme.',
    ],
    metrics: [
      { value: '9 days', label: 'outreach to event' },
      { value: '70+', label: 'founders & CEOs in the room' },
    ],
    trustedBy: ['UNIDO (UN)', 'European Union'],
    tags: ['Ecosystem', 'Outreach'],
  },
  {
    slug: 'wonder-women',
    org: 'Wonder Women',
    role: 'Co-Founder & Head of Product',
    kind: 'founder',
    start: '2022-05',
    end: '2024-10',
    dateLabel: 'May 2022 – Oct 2024',
    location: 'Pakistan',
    tense: 'past',
    summary:
      'Co-founded Pakistan’s FemTech startup and built both sides — the physical product (Asani) and the digital health platform on top.',
    highlights: [
      'Built Asani — Pakistan’s first locally-assembled sanitary-pad vending machine, at ~1/10th the imported cost.',
      'Drove it from pre-revenue to PKR 3.7M revenue in the first 12 months: 29 machines · 24 locations · 75,000+ transactions.',
      'Won the HEC Innovator Seed Fund (USD 35,000) — 1 of 15 from 186 applicants.',
      'Closed Procter & Gamble (#AlwaysAsani) and negotiated a partial-exclusivity carve-out — as a young founder, across the table from a multinational.',
    ],
    metrics: [
      { value: '75,000+', label: 'transactions' },
      { value: 'PKR 3.7M', label: 'first-year revenue' },
      { value: 'USD 35K', label: 'HEC seed fund won' },
    ],
    trustedBy: [
      'Procter & Gamble',
      'Engro',
      'NETSOL',
      'Sapphire',
      'Devsinc',
      'Aga Khan University Hospital',
    ],
    tags: ['FemTech', 'Hardware', 'Founder', 'Product'],
    featured: true,
  },
  {
    slug: 'circle-gates',
    org: 'CIRCLE Women',
    role: 'Program Manager & Business Intelligence Lead',
    kind: 'institutional',
    start: '2023-02',
    end: '2023-10',
    dateLabel: 'Feb 2023 – Oct 2023',
    location: 'Pakistan',
    tense: 'past',
    summary:
      'Ran the Bill & Melinda Gates Foundation–backed Digital Literacy Programme end-to-end, and built the BI system that measured it.',
    highlights: [
      'Delivered end-to-end programme management — scope, timelines, KPIs, stakeholder management — backed by the Bill & Melinda Gates Foundation.',
      'Trained 10,000 women across digital literacy, financial literacy, business, and life skills during his tenure.',
      'Rebuilt CIRCLE’s impact-measurement system in Power BI — automated dashboards and pipelines that kept running after he left.',
      'Cut reporting time by 40% and improved resource-allocation efficiency by 20%.',
    ],
    metrics: [
      { value: '10,000', label: 'women trained' },
      { value: '−40%', label: 'reporting time' },
    ],
    trustedBy: ['Bill & Melinda Gates Foundation'],
    tags: ['Programme delivery', 'Business Intelligence'],
  },
  {
    slug: 'id92',
    org: 'Innovation District 92',
    role: 'Head of Business Development (Startups)',
    kind: 'ecosystem',
    start: '2021-02',
    end: '2023-02',
    dateLabel: 'Feb 2021 – Feb 2023',
    location: 'Superior University, Pakistan',
    tense: 'past',
    summary:
      'Went from multi-role operator to national-scale ecosystem builder — convening startup competitions at country scale.',
    highlights: [
      'Country Host / National Organiser for the Entrepreneurship World Cup (2021 & 2022) — 5,000+ applicants in 2021.',
      'Team Lead & Project Manager for the SEE Pakistan National Startup Championship 2022 — 1,500+ startups across 81 cities and 5 provinces.',
      'Drove a 30% lift in incubation outcomes and 15+ ecosystem partnerships at ID92.',
    ],
    metrics: [
      { value: '5,000+', label: 'EWC applicants (2021)' },
      { value: '1,500+', label: 'startups, SEE Pakistan' },
    ],
    tags: ['Ecosystem', 'Programme management'],
  },
  {
    slug: 'giz',
    org: 'GIZ',
    role: 'Consultant — Programme Migration & Diaspora',
    kind: 'institutional',
    start: '2021-12',
    end: '2022-04',
    dateLabel: 'Dec 2021 – Apr 2022',
    location: 'Germany & Pakistan',
    tense: 'past',
    summary:
      'A consultancy with the German federal government’s development agency, across Germany and Pakistan.',
    highlights: [
      'Worked on regular, safe-migration pathways to Germany — developing branding and information-exchange materials.',
      'A short, well-framed engagement carried as a credibility anchor: international scope, federal-government counterpart.',
    ],
    trustedBy: ['GIZ (German federal government)'],
    tags: ['Consulting', 'International'],
  },
  {
    slug: 'origin',
    org: 'Freelance & early product roles',
    role: 'Developer · Product Coordinator',
    kind: 'early',
    start: '2017-01',
    end: '2021-01',
    dateLabel: '2017 – 2021',
    location: 'Pakistan & remote (Sweden, Indonesia)',
    tense: 'past',
    summary:
      'The polymath foundation — learning the whole stack of building and growing a tech company, in parallel, from the code up.',
    highlights: [
      'Community Manager at Evolve Machine Learners — 30+ events, 500+ participants, corporate AI training for Philip Morris International and Trimegah Sekuritas Indonesia.',
      'Product Coordinator at Intelsys / Green Plank (Sweden) — drove measurable lifts in online sales and engagement.',
      'Freelance developer across C++, Java, Ruby on Rails, React, and Android.',
    ],
    tags: ['Origin', 'Developer'],
  },
]

/** Roles that are currently active. */
export const CURRENT_EXPERIENCE = EXPERIENCE.filter((e) => e.end === 'present')

/** Lookup by slug. */
export function getExperience(slug: string): Experience | undefined {
  return EXPERIENCE.find((e) => e.slug === slug)
}
