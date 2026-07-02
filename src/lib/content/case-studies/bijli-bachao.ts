/**
 * Case study — Bijli Bachao. Compiled from canonical/02-bijli-bachao.md §1–§6 (WATTEY-TRUTH
 * discipline). Guardrails: NEVER a precise MW figure — "~3 MW and growing" only. Client names
 * publishable per §4.4 (2026-06-11). Founder credit: Engr. Reyyan Niaz Khan (public, credited).
 */

import type { CaseStudy } from '@/lib/types'

export const BIJLI_BACHAO: CaseStudy = {
  slug: 'bijli-bachao',
  eyebrow: 'Bijli Bachao · Energy platforms',
  title: 'Bijli Bachao',
  seoTitle: 'Bijli Bachao — three live IoT energy platforms, built to IEC standards',
  seoDescription:
    'Ali Ahmed designed, built, and runs Bijli Bachao’s three live IoT energy platforms — ' +
    'Wattey, Solar Performance Cloud, TenantBill — to IEC standards.',
  role: 'Head of Product & Platforms',
  dateLabel: 'October 2025 – present',
  status: 'live',
  answerCapsule:
    'Ali Ahmed leads Bijli Bachao’s complete software stack: three production SaaS platforms ' +
    'covering Pakistan’s commercial energy lifecycle. Wattey monitors what a business pulls from ' +
    'the grid, Solar Performance Cloud monitors what its solar generates, and TenantBill handles ' +
    'multi-tenant billing. All three run real factories, solar plants, and shopping malls today — ' +
    'about 3 megawatts and growing.',
  questionHeading: 'What do the three Bijli Bachao platforms do?',
  heroStats: [
    { value: '3', label: 'production platforms live' },
    { value: '~1.04 GWh', label: 'grid energy monitored by Wattey' },
    { value: '56 sites', label: 'solar plants on Solar Performance Cloud' },
    { value: '74 tenants', label: 'billed through TenantBill at one mall' },
  ],
  sections: [
    {
      kind: 'text',
      paras: [
        'BijliBachao.pk is Pakistan’s solar and energy-automation company, founded by Engr. ' +
          'Reyyan Niaz Khan — UET Lahore, 14+ years in Pakistan’s energy sector, and a pioneer ' +
          'of digital energy auditing in the country. Ali built the full platform stack for his ' +
          'company: one role, three platforms, one energy lifecycle.',
      ],
    },
    {
      kind: 'cards',
      heading: 'The three platforms',
      cards: [
        {
          title: 'Wattey — real-time IoT electricity monitoring',
          body:
            '22 smart meters live across 8 client sectors — hotels, textile, paper, dairy, ' +
            'malls — with ~1.04 GWh monitored since January 2026. Three-minute live refresh, ' +
            'Pakistan-specific seasonal time-of-use tariffs, automatic generator detection, and ' +
            'solar import/export tracking.',
          bullets: [
            '~500,000+ data points stored — voltage, current, power, energy, per phase',
            '459 kW highest peak load recorded at a single site',
            'Multi-tenant dashboard: clients see only their own sites, 4 user roles',
          ],
        },
        {
          title: 'Solar Performance Cloud — independent multi-brand solar monitoring',
          body:
            'Pakistan’s first independent multi-brand solar performance platform: 56 sites, 70 ' +
            'inverters, and 698 PV strings tracked individually across 5 brands (Huawei, Solis, ' +
            'Growatt, Sungrow, Canadian Solar) — 785 MWh tracked, 3.7 million+ readings, no ' +
            'hardware required.',
          bullets: [
            'Every string graded daily to the IEC 61724-1 performance-availability split',
            'Fault diagnosis that names the issue: dust, shading, dead panel, sensor fault',
            'Caught a 50% generation loss on one rooftop and a 33% loss at a mall the owner ' +
              'never knew about',
          ],
        },
        {
          title: 'TenantBill by Wattey — photo-verified OCR billing',
          body:
            'Live at Mall of Muridke: 74 tenants, 469 meters, and 545 shops across 8 floor ' +
            'categories, every reading photo-verified and extracted by OCR at 85–95% confidence ' +
            'in under 2 seconds. A monthly billing cycle that took 15 days now takes 3 hours.',
          bullets: [
            'Month-close with frozen snapshots and a full audit trail',
            '95% error reduction, 80% faster invoicing, 70% fewer tenant complaints',
            '3 weeks from signed contract to live operation',
          ],
        },
      ],
    },
    {
      kind: 'bullets',
      heading: 'How it’s built — the engineering moat',
      intro:
        'All three platforms share the same discipline, applied to Pakistani energy software ' +
        'from day one:',
      items: [
        'International standards: IEC 61724-1 health scoring and IEC 62446-1 five-state string ' +
          'classification — what utility-scale operators use globally.',
        'Multi-tenant SaaS architecture with org-scoped data isolation and role-based access ' +
          'control, the way enterprise buyers expect SaaS to be built.',
        'An observability baseline — error tracking, hourly system-health audits, health ' +
          'endpoints — plus enterprise-readiness audits across the suite.',
        'Operator-handover discipline: runbooks, audit reports, and change logs, so the software ' +
          'is maintainable by any competent operator, not dependent on its builder.',
      ],
    },
    {
      kind: 'text',
      heading: 'Who runs on it',
      paras: [
        'These are the platforms’ production clients — real Pakistani businesses: Lahore ' +
          'Continental Hotel, Mall of Mureedkay, Al Haram Paper Mill, FANZ Mills, Amna Dyeing & ' +
          'Finishing, Qadir Engineering, Zahoor Dairy Farm, and commercial sites in Gulberg, ' +
          'Lahore. Ali is the builder and Head of Product; operations stay with the ' +
          'BijliBachao team.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Are the Bijli Bachao platforms actually live?',
      answer:
        'Yes — all three run in production today. Wattey has monitored ~1.04 GWh across 22 ' +
        'smart meters since January 2026, Solar Performance Cloud tracks 56 solar sites with ' +
        '3.7 million+ readings, and TenantBill generates real invoices at Mall of Muridke every ' +
        'month.',
    },
    {
      question: 'What standards are they built to?',
      answer:
        'Solar Performance Cloud ships IEC 61724-1 performance-availability health scoring and ' +
        'IEC 62446-1 five-state string classification — the international engineering standards ' +
        'used by utility-scale solar operators — and all three platforms share multi-tenant, ' +
        'role-based enterprise SaaS architecture.',
    },
    {
      question: 'What is Ali Ahmed’s role at Bijli Bachao?',
      answer:
        'Head of Product & Platforms, since October 2025. He designed and built the three ' +
        'platforms and the company website; BijliBachao was founded by Engr. Reyyan Niaz Khan, ' +
        'and daily operations stay with the BijliBachao team.',
    },
  ],
  related: [
    { slug: 'cognilium', label: 'Cognilium AI — the parallel AI-products chapter' },
    { slug: 'wonder-women', label: 'Wonder Women — where the hardware story started' },
  ],
  projectSlugs: ['wattey', 'solar-performance-cloud', 'tenantbill'],
  external: { label: 'bijlibachao.pk', href: 'https://bijlibachao.pk' },
  featured: true,
}
