/**
 * CAPABILITIES + AUDIENCES. Only interview-room-defensible areas (the AI-application layer +
 * the product/solutions/GTM layer). Never from-scratch SWE/ML depth (fine-tuning, MLOps, deep
 * cloud infra, Python/React as personal skills that trigger a coding screen). No "vibe coding".
 */

import type { Audience, Capability } from '@/lib/types'

export const CAPABILITIES: Capability[] = [
  {
    title: 'Applied AI, built to ship',
    description:
      'I turn vague problems into LLM/RAG products and AI agents that run in production — mapping the real workflow, defining the metric that matters, and releasing in iterations.',
    skills: [
      'Large Language Models',
      'Retrieval-Augmented Generation',
      'AI agents & agentic systems',
      'LLM evaluation (evals)',
      'Vector databases',
      'LangChain / LangGraph',
      'Prompt engineering',
      'Model Context Protocol',
      'Voice AI',
    ],
  },
  {
    title: 'Product & solution ownership',
    description:
      'I own the build and the business behind it — scoping, pre-sales, delivery, and the metric the customer actually cares about.',
    skills: [
      'Product management',
      'Solution design',
      'Pre-sales engineering',
      'Customer-facing delivery',
      'Stakeholder management',
    ],
  },
  {
    title: 'Go-to-market from zero',
    description:
      'I’ve built growth engines from nothing — outreach systems, brand, and the operating spine (HR, finance, compliance) that turns a product into a business.',
    skills: ['Go-to-market strategy', 'Growth engineering', 'Operations'],
  },
]

/** Flat list of defensible expertise → feeds Person.knowsAbout in JSON-LD. */
export const KNOWS_ABOUT: string[] = Array.from(new Set(CAPABILITIES.flatMap((c) => c.skills)))

/**
 * Wikipedia anchors for the linkable topics — entity-grounds knowsAbout (Thing + sameAs) so a
 * common name resolves to the right concepts. Soft/GTM skills stay bare strings (no clean entity).
 */
const TOPIC_WIKIPEDIA: Record<string, string> = {
  'Large Language Models': 'https://en.wikipedia.org/wiki/Large_language_model',
  'Retrieval-Augmented Generation': 'https://en.wikipedia.org/wiki/Retrieval-augmented_generation',
  'AI agents': 'https://en.wikipedia.org/wiki/Intelligent_agent',
  'Vector databases': 'https://en.wikipedia.org/wiki/Vector_database',
  LangChain: 'https://en.wikipedia.org/wiki/LangChain',
  'Prompt engineering': 'https://en.wikipedia.org/wiki/Prompt_engineering',
  'Model Context Protocol': 'https://en.wikipedia.org/wiki/Model_Context_Protocol',
  'Product management': 'https://en.wikipedia.org/wiki/Product_management',
  'Go-to-market strategy': 'https://en.wikipedia.org/wiki/Go-to-market_strategy',
}

/** knowsAbout for JSON-LD: a Thing (with Wikipedia sameAs) where we have an anchor, else a string. */
export type KnowsAboutEntry = string | { '@type': 'Thing'; name: string; sameAs: string }
export const KNOWS_ABOUT_LINKED: KnowsAboutEntry[] = KNOWS_ABOUT.map((skill) => {
  const wiki = TOPIC_WIKIPEDIA[skill]
  return wiki ? { '@type': 'Thing' as const, name: skill, sameAs: wiki } : skill
})

export const AUDIENCES: Audience[] = [
  {
    slug: 'hiring',
    title: 'Hiring teams',
    pitch:
      'Looking for someone who can take an AI product from idea to production and own the outcome — AI Solutions Engineer / Forward-Deployed Engineer, remote-global or relocation.',
  },
  {
    slug: 'clients',
    title: 'Founders & teams',
    pitch:
      'Need an AI feature or product shipped fast and for real? I do fractional AI-delivery — scoping, building, and deploying LLM/RAG products and agents.',
  },
]
