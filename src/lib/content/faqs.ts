/**
 * FAQS — answer-first, quotable Q&A (the format AI engines extract from). Each answer leads with
 * a self-contained, factual sentence. Honors all guardrails. Used by the FAQ section + FAQPage schema.
 */

import type { Faq } from '@/lib/types'

export const FAQS: Faq[] = [
  {
    question: 'Who is Ali Ahmed?',
    answer:
      'Ali Ahmed is an AI Solutions Engineer who builds what he sells — turning business problems into ' +
      'LLM/RAG products, AI agents, and IoT platforms that ship to production. He is AI Solutions Engineer ' +
      'at Cognilium AI and Head of Product & Platforms at Bijli Bachao.',
  },
  {
    question: 'What does Ali Ahmed build?',
    answer:
      'He has shipped four AI products at Cognilium AI (Paralegent, VORTA, ProspectVox, VectorHire) and ' +
      'three live IoT energy platforms at Bijli Bachao (Wattey, Solar Performance Cloud, TenantBill).',
  },
  {
    question: 'What is Ali Ahmed’s background with the Gates Foundation and UNIDO?',
    answer:
      'He is trusted to deliver programmes backed by these institutions: he ran a Bill & Melinda Gates ' +
      'Foundation–backed digital-literacy programme (via CIRCLE) that trained 10,000 women, and led outreach ' +
      'for a UNIDO programme (via Digitara).',
  },
  {
    question: 'Is Ali Ahmed available for hire or consulting?',
    answer:
      'Yes — he is open to remote-global roles and relocation to the Gulf, US, or Australia, plus fractional ' +
      'AI-delivery consulting for founders and teams.',
  },
  {
    question: 'What is Ali Ahmed’s core expertise?',
    answer:
      'The AI-application layer — LLMs, RAG, AI agents, evals, vector databases, and LangChain/LangGraph — ' +
      'plus the product and go-to-market layer: he owns both the build and the business behind it.',
  },
]
