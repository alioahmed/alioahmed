/**
 * Case study — the startup-ecosystem chapter: ID92 + EWC Pakistan + SEE Pakistan as ONE role
 * (EWC/SEE were concurrent programme roles under ID92 — canonical/06-id92.md, CV-reconciled
 * figures). UNIDO appears ONLY at summary depth (canonical 04 keeps the deep story private):
 * "mobilised/assembled" — never "presented/spoke on stage".
 */

import type { CaseStudy } from '@/lib/types'

export const STARTUP_ECOSYSTEM: CaseStudy = {
  slug: 'startup-ecosystem',
  eyebrow: 'ID92 · EWC · SEE Pakistan',
  title: 'Startup ecosystem at national scale',
  seoTitle: 'Startup ecosystem — EWC Pakistan, SEE Pakistan & Innovation District 92',
  seoDescription:
    'Ali Ahmed ran Pakistan’s startup ecosystem at national scale: EWC Pakistan Country Host ' +
    '(5,000+ applicants) and SEE Pakistan 2022 (25,000+ attendees).',
  role: 'Head of Business Development (Startups), Innovation District 92',
  dateLabel: 'February 2021 – February 2023',
  status: 'concluded',
  answerCapsule:
    'Ali Ahmed spent two years running Pakistan’s startup ecosystem at national scale: Country ' +
    'Host and National Organiser of the Entrepreneurship World Cup Pakistan for two consecutive ' +
    'years, Team Lead of the SEE Pakistan National Startup Championship 2022, and Head of ' +
    'Business Development at Innovation District 92, the startup incubation centre of Superior ' +
    'University.',
  questionHeading: 'What has Ali Ahmed run at national scale?',
  heroStats: [
    { value: '5,000+', label: 'EWC Pakistan applicants (2021)' },
    { value: '1,500+', label: 'startups engaged, SEE Pakistan 2022' },
    { value: '81', label: 'cities reached across 5 provinces' },
    { value: '25,000+', label: 'attendees at the Expo Center Lahore finale' },
  ],
  sections: [
    {
      kind: 'text',
      paras: [
        'Innovation District 92 is where Ali moved from multi-role operator to national-scale ' +
          'ecosystem builder. The base job: make Superior University’s incubation engine produce ' +
          'viable businesses — working founder-by-founder on proposals and progress, building a ' +
          'mentor network from scratch, establishing 15+ strategic partnerships, and running 20+ ' +
          'workshops. Outcome: a 30% increase in successful incubation outcomes.',
        'The headline is what he ran on top of that — two national startup competitions, ' +
          'back-to-back, at 24–25 years old: work most institutions hand to teams of ten or more.',
      ],
    },
    {
      kind: 'bullets',
      heading: 'Entrepreneurship World Cup Pakistan — Country Host, 2021 & 2022',
      intro:
        'The EWC is the Global Entrepreneurship Network’s worldwide pitch competition. Ali ran ' +
        'Pakistan’s national programme for two consecutive years, owning the full value chain:',
      items: [
        '5,000+ applicants in 2021 — 700+ applications in the first two weeks of the nationwide ' +
          'campaign.',
        '100 startups shortlisted, 40 judges coordinated nationwide for the semi-finals.',
        'National Finals at Arfa Software Technology Park — 16 top startups competing, the top 3 ' +
          'advancing to the international stage.',
      ],
    },
    {
      kind: 'bullets',
      heading: 'SEE Pakistan 2022 — National Startup Championship, Team Lead',
      intro:
        'The Social Enterprise Expo, powered by APSUP (the Association of Private Sector ' +
        'Universities of Pakistan) — the larger of the two competitions:',
      items: [
        '1,500+ startups engaged from 81 cities, 5 provinces, 129 universities, and 30 ' +
          'incubation centres.',
        'Seven regional semi-finals — Lahore, Peshawar, Islamabad, Karachi, Multan, Faisalabad, ' +
          'Quetta — each a standalone event with its own venue, judges, and logistics.',
        'Grand finale at Expo Center Lahore: 100 startups showcased expo-style in front of ' +
          '25,000+ attendees.',
        '16 community partnerships, 7 venue partners, 4 knowledge partners, and 40+ judges ' +
          'across rounds.',
      ],
    },
    {
      kind: 'cards',
      heading: 'The network compounds',
      cards: [
        {
          title: 'UNIDO PAIDAR — the room this network built',
          body:
            'Three years later, the UN’s industrial development agency needed Pakistan’s startup ' +
            'elite in one room for an EU-funded programme. Working via Digitara, Ali assembled ' +
            'it in 9 days with zero budget: Fiza Farhan on keynote, five panelists, and 70+ ' +
            'founders and CEOs in attendance across Karachi and Lahore events.',
        },
        {
          title: 'Both sides of the table',
          body:
            'Ali has judged the ecosystem as an organiser and won in it as a founder — Wonder ' +
            'Women placed Top 100 Global Startups at the very competition network he later ' +
            'hosted nationally.',
          href: '/work/wonder-women',
        },
      ],
    },
  ],
  faqs: [
    {
      question: 'What is the Entrepreneurship World Cup, and what was Ali’s role?',
      answer:
        'The Entrepreneurship World Cup is a global pitch competition run by the Global ' +
        'Entrepreneurship Network. Ali was Country Host / National Organiser for Pakistan in ' +
        '2021 and 2022 — 5,000+ applicants, 40 judges, and National Finals at Arfa Software ' +
        'Technology Park.',
    },
    {
      question: 'What was SEE Pakistan 2022?',
      answer:
        'The Social Enterprise Expo’s National Startup Championship, powered by APSUP. As Team ' +
        'Lead & Project Manager, Ali ran a campaign reaching 1,500+ startups across 81 cities ' +
        'and 5 provinces, seven regional semi-finals, and a grand finale at Expo Center Lahore ' +
        'with 25,000+ attendees.',
    },
    {
      question: 'Does Ali still work with startup ecosystems?',
      answer:
        'Yes — the network never stopped compounding. In 2026 he mobilised 70+ founders and ' +
        'CEOs for a UNIDO programme funded by the European Union, and he consults for founders ' +
        'building AI products today.',
    },
  ],
  related: [
    { slug: 'circle-gates', label: 'CIRCLE × Gates Foundation — institutional delivery' },
    { slug: 'wonder-women', label: 'Wonder Women — the founder side of the story' },
  ],
}
