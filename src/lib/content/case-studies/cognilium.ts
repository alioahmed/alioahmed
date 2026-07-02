/**
 * Case study — Cognilium AI. Compiled from canonical/03-cognilium.md §1–§10 (public sections
 * only). Guardrails: Founder & CEO is Mudassir Marwat — Ali joined Sept 2024 (company founded
 * 2019); never imply founding. Verified figures only (COG-10 banned-words discipline).
 */

import type { CaseStudy } from '@/lib/types'

export const COGNILIUM: CaseStudy = {
  slug: 'cognilium',
  eyebrow: 'Cognilium AI · AI products & growth',
  title: 'Cognilium AI',
  seoTitle: 'Cognilium AI — four AI products, a growth engine, and the operations behind them',
  seoDescription:
    'At Cognilium AI, Ali Ahmed took four AI products idea-to-production, coded two production ' +
    'websites, and built a growth engine worth USD 50,000+ from zero.',
  role: 'AI Solutions Engineer',
  dateLabel: 'September 2024 – present',
  status: 'production',
  answerCapsule:
    'At Cognilium AI, Ali Ahmed took four AI products from idea to production — Paralegent, VORTA, ' +
    'ProspectVox, and VectorHire — coded two production websites end-to-end, and built the firm’s ' +
    'growth engine, HR, and finance operations from zero, bringing in more than USD 50,000 in ' +
    'client value.',
  questionHeading: 'What did Ali Ahmed build at Cognilium AI?',
  heroStats: [
    { value: '4', label: 'AI products in production' },
    { value: 'USD 50K+', label: 'client value from a growth engine built from zero' },
    { value: '2', label: 'production websites coded end-to-end' },
    { value: '5', label: 'functional buckets owned' },
  ],
  sections: [
    {
      kind: 'text',
      paras: [
        'Cognilium AI is a boutique AI engineering firm — generative AI, agentic systems, and ' +
          'custom AI products — founded in 2019 by Mudassir Marwat (Founder & CEO), with clients ' +
          'across the US, UAE, and Pakistan.',
        'Ali joined in September 2024 and built, function by function, the commercial machine ' +
          'that turns an early-stage AI engineering firm into a company with shipped products, a ' +
          'growth engine, and operating discipline. Five buckets, one operator: products, brand ' +
          'and websites, growth, HR and team ops, and finance and compliance. He operates like a ' +
          'founder across every function except equity.',
      ],
    },
    {
      kind: 'cards',
      heading: 'Four AI products, idea to production',
      cards: [
        {
          title: 'Paralegent AI — agentic legal contract review',
          body:
            '18+ specialised AI agents plus an orchestrator, reviewing contracts against the ' +
            'customer’s own playbook. Cuts a Master Sales Agreement review from 30 hours to ' +
            'about 30 minutes. Deploys in the customer’s own cloud.',
          href: '/work/paralegent',
        },
        {
          title: 'VORTA — enterprise RAG assistant',
          body:
            '92% first-call resolution across 22 languages. Replaced a 24-person support team ' +
            'at the deploying client and delivered USD 400,000 in savings.',
        },
        {
          title: 'ProspectVox — voice sales AI',
          body:
            'A 5-stage AI agent workflow for outbound voice prospecting — 47% connect rate, from ' +
            'prospect identification through intelligent follow-up.',
        },
        {
          title: 'VectorHire — AI recruitment',
          body:
            'Four parallel AI agents evaluate every candidate simultaneously — resume quality, ' +
            'skill match, experience, and fit — cutting hiring time by 60%.',
        },
      ],
    },
    {
      kind: 'text',
      heading: 'Two production websites, coded end-to-end',
      paras: [
        'Ali is not only the product owner — he coded the production platforms himself. ' +
          'Cognilium.ai: 76 page routes, 264 React components, 13 API routes, Sanity CMS, and a ' +
          '34-script SEO/GEO automation toolkit — 251 commits over roughly nine months on ' +
          'Next.js, React, and TypeScript.',
        'Paralegent.ai: 56 statically rendered pages, 50 components, and a 26-script SEO ' +
          'pipeline — 737 commits from January to June 2026, live and indexed. He also built a ' +
          'production Chrome extension for proposal automation that tripled the proposal ' +
          'response rate.',
      ],
    },
    {
      kind: 'text',
      heading: 'A growth engine from zero',
      paras: [
        'Customer acquisition did not exist when Ali arrived. He built it end-to-end: a ' +
          'research-driven Upwork strategy (the April 2026 profile rebuild traced every decision ' +
          'to one of 14 specific research findings), a 6-domain cold-email infrastructure with ' +
          '30+ warmed sender accounts across three providers, handcrafted LinkedIn outreach to ' +
          'US decision-makers, 15+ AdTech companies researched and pursued, and a 19-section AI ' +
          'sales-agent playbook. Outcome: clients worth more than USD 50,000.',
      ],
    },
    {
      kind: 'bullets',
      heading: 'Operations: HR, finance & compliance',
      intro: 'The unglamorous machinery that makes a firm real — built from scratch:',
      items: [
        'A 24-section staff policy manual and a 9-section employee NDA, authored end-to-end.',
        'A recruitment pipeline — job descriptions, interviews, offers — including hiring ' +
          'full-stack AI engineers.',
        'Trained a business-development intern into the role over three months, listed as his ' +
          'Team Lead.',
        'Banking, PSEB registration renewal, IT-export compliance, and international ' +
          'remittance management.',
      ],
    },
  ],
  faqs: [
    {
      question: 'What is Ali Ahmed’s role at Cognilium AI?',
      answer:
        'AI Solutions Engineer. Cognilium AI was founded in 2019 by Mudassir Marwat, its Founder ' +
        '& CEO; Ali joined in September 2024 and owns five functional buckets — products, brand ' +
        'and websites, growth engine, HR and team ops, and finance and compliance.',
    },
    {
      question: 'Which AI products has Ali shipped at Cognilium?',
      answer:
        'Four, all idea-to-production: Paralegent AI (agentic legal contract review, live at ' +
        'paralegent.ai), VORTA (enterprise RAG, 92% first-call resolution), ProspectVox (voice ' +
        'sales AI, 47% connect rate), and VectorHire (AI recruitment, 60% faster hiring).',
    },
    {
      question: 'Did Ali build the Cognilium websites too?',
      answer:
        'Yes — he coded both production sites end-to-end: cognilium.ai (76 pages, 264 React ' +
        'components, Sanity CMS) and paralegent.ai (56 pages, 737 commits), plus a production ' +
        'Chrome extension that tripled proposal response rates.',
    },
  ],
  related: [
    { slug: 'paralegent', label: 'Paralegent AI — the deepest single build' },
    { slug: 'bijli-bachao', label: 'Bijli Bachao — three live IoT energy platforms' },
  ],
  projectSlugs: ['paralegent', 'vorta', 'prospectvox', 'vectorhire'],
  external: { label: 'cognilium.ai', href: 'https://cognilium.ai' },
  featured: true,
}
