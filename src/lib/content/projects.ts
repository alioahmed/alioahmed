/**
 * PROJECTS — the portfolio (things Ali built). Sourced from canonicals 02, 03, P1, P2.
 *
 * GUARDRAILS: Paralegent — Ali is AI Product Manager (Mudassir is Founder/CEO); clients are
 * under NDA, no names/logos/retracted stats. Build Buy Software — "Product & Editorial Lead",
 * PRE-LAUNCH (never "running a successful directory"); don't round 420. Bijli Bachao platforms
 * carry no precise MW. No "vibe coding"; building is "AI-native development, ships fast".
 */

import type { Project } from '@/lib/types'

export const PROJECTS: Project[] = [
  // ---- Cognilium AI products ----
  {
    slug: 'paralegent',
    name: 'Paralegent',
    tagline: 'Agentic contract due-diligence, inside Microsoft Word.',
    kind: 'ai-product',
    org: 'Cognilium AI',
    role: 'AI Product Manager',
    status: 'production',
    year: '2026',
    summary:
      'An agentic legal-AI system that reviews contracts against a customer’s own playbook and returns ' +
      'GREEN/ORANGE/RED redlines — deployed in the customer’s own cloud, not as SaaS.',
    highlights: [
      '18+ specialised AI agents plus an orchestrator on LangGraph + Google ADK, LLM-agnostic.',
      'Turns ~30 hours of MSA review into ~30 minutes; 40–50 findings per MSA.',
      'Built the go-to-market website end-to-end (56 pages, 50 components).',
    ],
    metrics: [
      { value: '18+', label: 'AI agents' },
      { value: '30h → 30m', label: 'per MSA review' },
    ],
    stack: ['LangGraph', 'Google ADK', 'Azure OpenAI', 'Next.js'],
    featured: true,
  },
  {
    slug: 'vorta',
    name: 'VORTA',
    tagline: 'Enterprise RAG assistant at 92% first-call resolution.',
    kind: 'ai-product',
    org: 'Cognilium AI',
    role: 'AI Solutions Engineer',
    status: 'production',
    summary:
      'A retrieval-augmented enterprise assistant that hit 92% first-call resolution across 22 languages — ' +
      'with the kind of impact that replaced a 24-person support team.',
    highlights: [
      '92% first-call resolution; 22 languages.',
      'Drove an estimated USD 400K in savings for the deployment.',
    ],
    metrics: [
      { value: '92%', label: 'first-call resolution' },
      { value: 'USD 400K', label: 'estimated savings' },
    ],
    stack: ['RAG', 'Vector DB', 'LLM evals'],
    featured: true,
  },
  {
    slug: 'prospectvox',
    name: 'ProspectVox',
    tagline: 'Voice sales agent that actually connects.',
    kind: 'ai-product',
    org: 'Cognilium AI',
    role: 'AI Solutions Engineer',
    status: 'production',
    summary: 'A voice AI sales agent built idea → production, tuned for real connect rates.',
    highlights: ['47% connect rate on live outreach.'],
    metrics: [{ value: '47%', label: 'connect rate' }],
    stack: ['Voice AI', 'LLM'],
  },
  {
    slug: 'vectorhire',
    name: 'VectorHire',
    tagline: 'AI recruitment that cuts hiring time.',
    kind: 'ai-product',
    org: 'Cognilium AI',
    role: 'AI Solutions Engineer',
    status: 'production',
    summary: 'An AI recruiter built idea → production that compresses the hiring funnel.',
    highlights: ['~60% reduction in hiring time.'],
    metrics: [{ value: '−60%', label: 'hiring time' }],
    stack: ['LLM', 'Vector DB'],
  },

  // ---- Bijli Bachao platforms ----
  {
    slug: 'wattey',
    name: 'Wattey',
    tagline: 'Real-time IoT electricity monitoring for industry.',
    kind: 'iot-platform',
    org: 'Bijli Bachao',
    role: 'Head of Product & Platforms',
    status: 'live',
    summary:
      'Real-time grid-consumption monitoring for Pakistani factories, mills, malls, and hotels — built to IEC standards.',
    highlights: ['~1.04 GWh tracked across 22 meters in 8 sectors.'],
    metrics: [{ value: '~1.04 GWh', label: 'monitored' }],
    stack: ['IoT', 'SaaS', 'Time-series'],
    featured: true,
  },
  {
    slug: 'solar-performance-cloud',
    name: 'Solar Performance Cloud',
    tagline: 'Independent, string-level solar monitoring.',
    kind: 'iot-platform',
    org: 'Bijli Bachao',
    role: 'Head of Product & Platforms',
    status: 'live',
    summary:
      'Independent, multi-brand solar-generation monitoring down to the PV-circuit level — aligned to IEC 61724-1 and IEC 62446-1.',
    highlights: ['56 sites · 70 inverters · 698 PV strings · 5 inverter brands · 785 MWh tracked.'],
    metrics: [
      { value: '56', label: 'sites' },
      { value: '785 MWh', label: 'tracked' },
    ],
    stack: ['IoT', 'SaaS', 'Solar'],
    featured: true,
  },
  {
    slug: 'tenantbill',
    name: 'TenantBill',
    tagline: 'OCR-verified multi-tenant billing.',
    kind: 'iot-platform',
    org: 'Bijli Bachao',
    role: 'Head of Product & Platforms',
    status: 'live',
    summary:
      'Photo-verified multi-tenant electricity billing for malls and commercial properties — live in a real mall.',
    highlights: ['74 tenants · 469 meters; OCR-verified invoicing.'],
    metrics: [{ value: '74', label: 'tenants billed' }],
    stack: ['OCR', 'SaaS'],
  },

  // ---- Independent venture ----
  {
    slug: 'build-buy-software',
    name: 'Build Buy Software',
    tagline: 'A transparent legal-tech product directory.',
    kind: 'venture',
    org: 'Independent',
    role: 'Product & Editorial Lead',
    status: 'pre-launch',
    year: '2026',
    summary:
      'An independent legal-tech directory built as the structural opposite of the AI-scraped black box: ' +
      'a published scoring formula, provenance fields, and a build-failing quality gate. In pre-launch.',
    highlights: [
      '420 products · 387 vendors · 10 categories, with a published, unbuyable BBS scoring methodology.',
      '~2,000 static pages and 27 data-backed articles, built end-to-end in under a month.',
    ],
    metrics: [
      { value: '420', label: 'products catalogued' },
      { value: '~2,000', label: 'static pages' },
    ],
    stack: ['Next.js', 'Static generation', 'CI quality gate'],
  },

  // ---- Wonder Women hardware ----
  {
    slug: 'asani',
    name: 'Asani',
    tagline: 'Pakistan’s first locally-assembled sanitary-pad vending machine.',
    kind: 'hardware',
    org: 'Wonder Women',
    role: 'Co-Founder & Head of Product',
    status: 'shipped',
    summary:
      'A wall-mounted sanitary-napkin vending machine designed and locally assembled at ~1/10th the cost of imports.',
    highlights: ['29 machines · 24 locations · 75,000+ transactions.'],
    metrics: [{ value: '29', label: 'machines deployed' }],
    stack: ['Hardware', 'Embedded'],
  },
]

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured)

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug)
}
