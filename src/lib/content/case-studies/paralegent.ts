/**
 * Case study — Paralegent AI. Compiled from canonical/P1-paralegent.md (§7 = the forbidden
 * list — retracted stats never appear here). Attribution boundary is load-bearing: Mudassir
 * Marwat is Founder & CEO and the site's bylined author; Ali = AI Product Manager + built the
 * GTM site end-to-end. "Playbook" (never "rulebook"); not SaaS (never "platform/hosted/per-seat").
 */

import type { CaseStudy } from '@/lib/types'

export const PARALEGENT: CaseStudy = {
  slug: 'paralegent',
  eyebrow: 'Cognilium AI · Agentic legal AI',
  title: 'Paralegent AI',
  seoTitle: 'Paralegent AI — 18+ agents that review contracts against your own playbook',
  seoDescription:
    'Paralegent AI reviews contracts against your own playbook with 18+ AI agents — 30 hours to ' +
    '30 minutes per MSA. Ali Ahmed led product and built its GTM site.',
  role: 'AI Product Manager · built the GTM site end-to-end',
  dateLabel: 'January 2026 – present',
  status: 'production',
  answerCapsule:
    'Paralegent AI is an agentic contract-review accelerator that analyses contracts against a ' +
    'customer’s own playbook using 18+ specialised AI agents, returns GREEN, ORANGE, or RED ' +
    'redlines inside Microsoft Word in minutes, and deploys entirely in the customer’s own cloud. ' +
    'Ali Ahmed led the product from ideation through production and built its go-to-market ' +
    'website end-to-end.',
  questionHeading: 'How does Paralegent review contracts?',
  heroStats: [
    { value: '18+', label: 'specialised AI agents + an orchestrator' },
    { value: '30 hrs → 30 min', label: 'per Master Sales Agreement review' },
    { value: '2–8 min', label: 'full analysis per contract' },
    { value: '56', label: 'pages in the GTM site Ali built' },
  ],
  sections: [
    {
      kind: 'text',
      paras: [
        'Most legal-AI tools are SaaS black boxes that ingest a customer’s most sensitive ' +
          'contracts into a vendor’s cloud. Paralegent AI was built as the structural opposite — ' +
          'it deploys inside the customer’s own environment, learns the customer’s own playbook ' +
          '(80–150 terms: preferred positions, fallback language, risk definitions) rather than ' +
          'a generic model’s opinion, and explains every call with a rationale, a suggested ' +
          'revision, and a confidence score.',
        'A legal team uploads its playbook once. From then on, 18+ AI specialists plus an ' +
          'orchestrator — built on LangGraph and Google ADK, LLM-agnostic across Azure OpenAI, ' +
          'AWS Bedrock, and Google Vertex AI — review any contract against it: a 15–20 second ' +
          'match via 1536-dimensional semantic search, then a full GREEN/ORANGE/RED redline ' +
          'analysis in 2–8 minutes, natively inside a Microsoft Word add-in.',
      ],
    },
    {
      kind: 'bullets',
      heading: 'The proof points',
      items: [
        'Cuts a Master Sales Agreement review from roughly 30 hours to about 30 minutes, ' +
          'surfacing 40–50 findings per MSA.',
        'Three-tier risk classification — GREEN / ORANGE / RED — each with a suggested revision ' +
          'in the customer’s preferred language, a rationale, and a confidence score.',
        'Not SaaS: deploys in the customer’s own cloud, so contract data never leaves their ' +
          'environment. Typical implementation is 8–10 weeks.',
        'In go-to-market with paying clients under NDA.',
      ],
    },
    {
      kind: 'text',
      heading: 'Who builds it — and Ali’s lane',
      paras: [
        'Paralegent AI is a product of Cognilium AI (founded 2019 — 50+ projects delivered, 96% ' +
          'client satisfaction). Mudassir Marwat is its Founder & CEO. Ali’s claim is two-layered ' +
          'and precise: he is the AI Product Manager who led Paralegent from ideation through ' +
          'production, and he built its entire public proof surface — the go-to-market website — ' +
          'end-to-end.',
      ],
    },
    {
      kind: 'bullets',
      heading: 'The go-to-market site, by the numbers',
      intro: 'Everything a buyer sees at paralegent.ai, Ali shipped:',
      items: [
        '56 statically rendered pages on Next.js 15, React 19, TypeScript, and Tailwind — 737 ' +
          'commits from January to June 2026.',
        '50 React components, 5 API routes, Sanity CMS with on-demand revalidation, and lead ' +
          'capture wired to Resend and Microsoft Bookings.',
        'A full AI-citation (GEO) stack — structured data on every page, robots.txt welcoming ' +
          '18+ AI crawlers, llms.txt, IndexNow, and a 26-script SEO automation pipeline.',
        'Five head-to-head comparison pages (vs manual review, Spellbook, ChatGPT, Harvey, ' +
          'LegalOn) — with verified product stats only, and no fabricated social proof.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Who built Paralegent AI?',
      answer:
        'Paralegent AI is a product of Cognilium AI. Mudassir Marwat is its Founder & CEO. Ali ' +
        'Ahmed is the AI Product Manager who led it from ideation through production, and he ' +
        'built the paralegent.ai go-to-market website end-to-end.',
    },
    {
      question: 'Is Paralegent a SaaS product?',
      answer:
        'No. Paralegent deploys inside the customer’s own cloud — contract data never leaves ' +
        'their environment. It reviews contracts against the customer’s own playbook, not a ' +
        'generic model’s opinion.',
    },
  ],
  related: [
    { slug: 'cognilium', label: 'Cognilium AI — the chapter around this product' },
    { slug: 'build-buy-software', label: 'Build Buy Software — the legal-tech thread continues' },
  ],
  projectSlugs: ['paralegent'],
  external: { label: 'paralegent.ai', href: 'https://paralegent.ai' },
}
