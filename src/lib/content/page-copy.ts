/**
 * PAGE COPY — every outward string for the non-case-study pages (home, /work, /about, /contact).
 * Pages render this data; no marketing string lives inline in JSX. All copy honors the
 * canonical guardrails (locked titles, no "solo", "trusted to deliver", dates-only, ~3 MW cap).
 *
 * Answer capsules are LINK-FREE and 20–70 words — the AEO gate requirement.
 */

export const HOME_COPY = {
  // ≤160-char meta description (the verbatim BIO.standard is too long for SERP snippets).
  seoDescription:
    'Ali Ahmed is an AI Solutions Engineer who builds what he sells — LLM/RAG products, AI ' +
    'agents & IoT platforms in production. Cognilium AI · Bijli Bachao.',
  hero: {
    ctaPrimary: { label: 'Get in touch', href: '/contact' },
    ctaSecondary: { label: 'See the work', href: '/work' },
    trustLabel: 'Trusted to deliver programmes and products for',
  },
  capabilities: {
    eyebrow: 'Capabilities',
    // The "?" heading — answer-engine format.
    title: 'What does Ali Ahmed actually build?',
    lead:
      'Three things that rarely live in one person: the build, the business behind it, and the ' +
      'institutional trust to run both at scale.',
  },
  work: {
    eyebrow: 'Selected work',
    title: 'Proof, not promises.',
    lead:
      'Four AI products in production, three live IoT energy platforms, and a co-founded FemTech ' +
      'that closed Procter & Gamble.',
    all: { label: 'All work', href: '/work' },
  },
  audiences: {
    eyebrow: 'Work with Ali',
    title: 'Hiring, or building?',
    lead: 'Two ways this usually starts.',
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Frequently asked questions',
  },
  closing: {
    eyebrow: 'Next step',
    title: 'Tell me the outcome. I’ll bring the rest.',
    lead: 'Email is fastest — expect a reply within a day.',
  },
} as const

export const WORK_COPY = {
  title: 'Work',
  seoTitle: 'Work — AI products, IoT platforms & national programmes',
  seoDescription:
    'What Ali Ahmed has shipped: four AI products in production, three live IoT energy ' +
    'platforms, a co-founded FemTech, and national-scale startup programmes.',
  // Link-free answer capsule (top of page).
  capsule:
    'Ali Ahmed has shipped four AI products in production, three live IoT energy platforms, and a ' +
    'co-founded FemTech hardware venture — plus national-scale startup programmes trusted by the ' +
    'Gates Foundation, UNIDO, and the European Union. Every case study below is built from verified, ' +
    'production figures.',
  shipped: {
    title: 'What has Ali Ahmed shipped?',
    lead: 'Grouped by the kind of proof each one carries.',
  },
  groups: [
    { key: 'ai', title: 'AI products', slugs: ['cognilium', 'paralegent'] },
    { key: 'energy', title: 'Energy platforms', slugs: ['bijli-bachao'] },
    { key: 'founder', title: 'Founder & ventures', slugs: ['wonder-women', 'build-buy-software'] },
    {
      key: 'institutional',
      title: 'Institutional & ecosystem',
      slugs: ['startup-ecosystem', 'circle-gates'],
    },
  ],
  table: {
    eyebrow: 'At a glance',
    title: 'The portfolio in one table',
    lead: 'Every product and platform, with Ali’s role and the headline figure.',
    columns: ['Product', 'Where', 'Ali’s role', 'Status', 'Headline metric'],
  },
  closing: {
    aboutLead: 'Want the story behind the work?',
    aboutLabel: 'About Ali',
    ctaLabel: 'Get in touch',
  },
} as const

export const ABOUT_COPY = {
  title: 'About Ali Ahmed',
  seoTitle: 'About — AI Solutions Engineer & founder-grade operator',
  seoDescription:
    'Who Ali Ahmed is: an AI Solutions Engineer who builds what he sells — four AI products, ' +
    'three IoT platforms, and Gates Foundation– & UNIDO-backed delivery.',
  // Link-free capsule, distinct from home's (which uses BIO.standard verbatim).
  capsule:
    'Ali Ahmed is an AI Solutions Engineer at Cognilium AI and Head of Product & Platforms at ' +
    'Bijli Bachao, based in Lahore, Pakistan. He builds LLM, RAG, and IoT products that run in ' +
    'production, and has delivered programmes backed by the Gates Foundation, UNIDO, the European ' +
    'Union, and GIZ.',
  bio: {
    eyebrow: 'The through-line',
    title: 'Builds it. Sells & runs it. Trusted with it.',
  },
  timeline: {
    eyebrow: 'Timeline',
    title: 'What has Ali Ahmed done, year by year?',
    lead: 'Every chapter, newest first — dates and verified figures only.',
  },
  credentials: {
    eyebrow: 'Capabilities & recognition',
    title: 'What he works with, and what it won',
  },
  availability: {
    eyebrow: 'Availability',
    title: 'Where can Ali work?',
    lead: 'Serious about the right seat — here is what fits.',
    ctaLabel: 'Start a conversation',
    workLead: 'Or judge the work first:',
    workLabel: 'see everything shipped',
  },
  beyondWork: {
    eyebrow: 'Beyond the work',
    line: 'There is a mountains-and-trails side to this story — it’s coming to this page soon.',
  },
} as const

export const CONTACT_COPY = {
  title: 'Contact',
  seoTitle: 'Contact — hire or work with Ali Ahmed',
  seoDescription:
    'Reach Ali Ahmed at ali@alioahmed.com — open to remote-global roles, relocation to the Gulf, ' +
    'US, Australia, or Canada, and fractional AI-delivery consulting.',
  // Link-free capsule.
  capsule:
    'The fastest way to reach Ali Ahmed is email — expect a reply within a day. He is open to ' +
    'remote-global roles, relocation, and fractional AI-delivery engagements for founders and teams ' +
    'who need AI products shipped to production.',
  channels: {
    title: 'What’s the best way to reach Ali Ahmed?',
    lead: 'Pick whatever is native to you — they all land with him.',
    ctaLabel: 'Email Ali',
  },
  audiences: {
    eyebrow: 'Who this is for',
    title: 'Who should get in touch?',
    workLead: 'Want to see the work first?',
    workLabel: 'Browse everything shipped',
    aboutLabel: 'or read the full story',
  },
  faqTitle: 'Quick answers',
} as const
