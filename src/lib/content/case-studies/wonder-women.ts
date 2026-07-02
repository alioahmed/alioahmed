/**
 * Case study — Wonder Women. Compiled from canonical/01-wonder-women.md §1–§14, §16.
 * Guardrails: role is LOCKED "Co-Founder & Head of Product" (never Founder/CEO/CTO); tenure is
 * dates only — NO exit reason, ever. Press coverage names the company, not Ali — framed as
 * company proof. Current wonderwomen.pk is NOT Ali's work — never linked.
 */

import type { CaseStudy } from '@/lib/types'

export const WONDER_WOMEN: CaseStudy = {
  slug: 'wonder-women',
  eyebrow: 'Wonder Women · Founder chapter',
  title: 'Wonder Women',
  seoTitle: 'Wonder Women — co-founding Pakistan’s FemTech startup and closing P&G',
  seoDescription:
    'Ali Ahmed co-founded Wonder Women, Pakistan’s FemTech startup: Asani vending machines, ' +
    '75,000+ transactions, a P&G partnership, and the HEC seed fund.',
  role: 'Co-Founder & Head of Product',
  dateLabel: 'May 2022 – October 2024',
  status: 'concluded',
  answerCapsule:
    'Wonder Women is the FemTech startup Ali Ahmed co-founded in Lahore: it built Asani, ' +
    'Pakistan’s first locally-assembled sanitary-pad vending machine, deployed 29 machines across ' +
    '24 locations, completed 75,000+ transactions, reached PKR 3.7 million revenue in its first ' +
    'twelve months, closed a Procter & Gamble partnership, and won the HEC Innovator Seed Fund.',
  questionHeading: 'What was Asani, and how far did it go?',
  heroStats: [
    { value: '29', label: 'machines across 24 locations' },
    { value: '75,000+', label: 'transactions completed' },
    { value: 'PKR 3.7M', label: 'revenue in the first 12 months' },
    { value: 'USD 35K', label: 'HEC Innovator Seed Fund won' },
  ],
  sections: [
    {
      kind: 'text',
      paras: [
        'Asani is Pakistan’s first locally-assembled wall-mounted sanitary-napkin vending ' +
          'machine — installed in female restrooms at universities, offices, and hospitals, ' +
          'taking cash, employee PIN, or app payment. Built at roughly one-tenth the cost of ' +
          'imported alternatives, with production capacity of ten machines a week.',
        'Ali joined as Co-Founder & Head of Product in May 2022 and owned the product ' +
          'end-to-end: hardware design and manufacturing oversight, the Asani mobile app, the ' +
          'multi-tenant partner portal, enterprise sales, pricing, and grant proposals — ' +
          'alongside co-founder Ayesha Haroon, whose campus period-emergency in 2019 sparked ' +
          'the original concept.',
        'In a country where one in three girls drops out of school on reaching puberty, the ' +
          'mission carried the product: access, dignity, and a stigma dismantled one restroom ' +
          'at a time.',
      ],
    },
    {
      kind: 'text',
      heading: 'The signature deal: closing Procter & Gamble',
      paras: [
        'In July 2022, Ali closed the #AlwaysAsani partnership with Procter & Gamble — a ' +
          'multinational FMCG giant partnering with a Pakistani FemTech startup. P&G covered ' +
          '53% of upfront machine cost with a 70-machine pipeline planned; Ali negotiated the ' +
          '12-month exclusivity down to a partial-exclusivity carve-out, keeping Wonder Women ' +
          'free to pursue other corporate clients while preserving the co-branding for ' +
          'educational institutions. A young co-founder holding that line across the table from ' +
          'a multinational is the moment the operator instinct shows.',
        'The delivery obsession showed elsewhere too: when a machine at Aga Khan University ' +
          'Hospital in Karachi developed a manufacturing fault, Ali flew Lahore to Karachi with ' +
          'the replacement part and fixed it on-site.',
      ],
    },
    {
      kind: 'bullets',
      heading: 'Deployments & partners',
      intro:
        'Machines ran at LUMS, UCP, FAST-NUCES, FCCU, GCU, and a dozen more institutions — ' +
        'with enterprise partners including:',
      items: [
        'Always (P&G) — the #AlwaysAsani campaign partner.',
        'Aga Khan University Hospital — 6 machines, the largest single deployment.',
        'Engro, Sapphire (three sites), NETSOL, Devsinc, Arbisoft, Superior University, and ' +
          'The Learning Hub Gujranwala.',
      ],
    },
    {
      kind: 'bullets',
      heading: 'Recognition',
      intro: 'Five national and international wins, plus 21+ national media features:',
      items: [
        'HEC Innovator Seed Fund — USD 35,000, one of 15 winners from 186 applicants (2022).',
        'Entrepreneurship World Cup — Top 100 Global Startups (2021).',
        'Falling Walls Lab — Pakistan Winner.',
        'Bahria Innovation Challenge — 1st place; SheLovesTech — Regional Competition Winner.',
        'Covered by ProPakistani, The Express Tribune, Pakistan Today, Daily Pakistan, and ' +
          'more — with social recognition from the US Consulate Lahore.',
      ],
    },
    {
      kind: 'text',
      heading: 'The pivot: hardware to digital health',
      paras: [
        'In late 2023 the company expanded from hardware into digital health, focused on PCOS — ' +
          'which affects an estimated 52% of Pakistani women. Ali shipped Pakistan’s first PCOS ' +
          'self-assessment tool (a personalised risk score in under three minutes), a moderated ' +
          'clinical community, and three structured care programs. His tenure concluded in ' +
          'October 2024.',
      ],
    },
  ],
  faqs: [
    {
      question: 'What was Ali Ahmed’s role at Wonder Women?',
      answer:
        'Co-Founder & Head of Product, May 2022 to October 2024. He owned the product ' +
        'end-to-end — the Asani hardware, the mobile app and partner portal, enterprise sales, ' +
        'and grant fundraising.',
    },
    {
      question: 'What recognition did Wonder Women win?',
      answer:
        'The HEC Innovator Seed Fund (USD 35,000 — 1 of 15 from 186 applicants), a Top 100 ' +
        'Global Startups placing at the Entrepreneurship World Cup 2021, Falling Walls Lab ' +
        'Pakistan, 1st place at the Bahria Innovation Challenge, and a SheLovesTech regional ' +
        'win — plus 21+ national media features.',
    },
  ],
  related: [
    { slug: 'startup-ecosystem', label: 'Startup ecosystem — the other side of the table' },
    { slug: 'bijli-bachao', label: 'Bijli Bachao — hardware discipline, applied to energy' },
  ],
  projectSlugs: ['asani'],
  featured: true,
}
