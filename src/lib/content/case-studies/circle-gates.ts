/**
 * Case study — CIRCLE × Gates Foundation DLP. Compiled from canonical/05-circle-gates.md
 * §1–§5 (CV-resolved figures). Guardrails: NEVER "worked at / employed by the Gates Foundation"
 * — the funder funded, CIRCLE implemented, Ali was at CIRCLE. 145,000/92-cities is CIRCLE's
 * organisational scale, not the DLP's — never imply Ali's programme reached it.
 */

import type { CaseStudy } from '@/lib/types'

export const CIRCLE_GATES: CaseStudy = {
  slug: 'circle-gates',
  eyebrow: 'CIRCLE · Gates Foundation–backed',
  title: 'CIRCLE × the Gates Foundation',
  seoTitle: 'CIRCLE × Gates Foundation — 10,000 women trained, and the BI system that proved it',
  seoDescription:
    'Ali Ahmed ran the Gates Foundation–funded Digital Literacy Program at CIRCLE — 10,000 ' +
    'women trained — and built the Power BI system that outlasted him.',
  role: 'Program Manager & Business Intelligence Lead',
  dateLabel: 'February 2023 – October 2023',
  status: 'concluded',
  answerCapsule:
    'At CIRCLE Women Association, Ali Ahmed ran the Digital Literacy Program funded by the Bill ' +
    '& Melinda Gates Foundation — training 10,000 women in digital, financial, business, and ' +
    'life skills over eight months — and built the Power BI system that measured it, cutting ' +
    'reporting time by 40%. The system kept running after he left.',
  questionHeading: 'What did the Gates-backed programme deliver?',
  heroStats: [
    { value: '10,000', label: 'women trained during his tenure' },
    { value: '−40%', label: 'reporting time after the BI rebuild' },
    { value: '25%', label: 'increase in online business ventures' },
    { value: '8 months', label: 'to a permanent operational upgrade' },
  ],
  sections: [
    {
      kind: 'text',
      paras: [
        'A Gates Foundation programme does not run on good intentions — it runs on proof. Every ' +
          'claim backed by data, every outcome measurable, every process documented against the ' +
          'foundation’s impact-measurement standards.',
        'CIRCLE Women Association — founded and led by Sadaffe Abid, serving women across ' +
          'Pakistan — was the implementing partner for the foundation-funded Digital Literacy ' +
          'Program. Ali ran it end-to-end: scope, timelines, KPIs defined around outcomes rather ' +
          'than activity (skill acquisition, income generation, businesses actually created), ' +
          'and stakeholder management spanning grassroots community organisations and a ' +
          'data-driven global foundation.',
      ],
    },
    {
      kind: 'bullets',
      heading: 'Programme delivery',
      items: [
        '10,000 women trained in digital literacy, financial literacy, business, and life ' +
          'skills during his tenure.',
        'A reported 25% increase in online business ventures among participants.',
        'KPIs set against the Gates Foundation’s impact-measurement standards from day one — ' +
          'outcomes, not sessions held.',
        'Multi-stakeholder delivery managed across beneficiaries, CIRCLE teams, training ' +
          'partners, and the funder’s monitoring framework.',
      ],
    },
    {
      kind: 'text',
      heading: 'The BI system that outlasted the operator',
      paras: [
        'When Ali arrived, impact was measured by hand — paper forms, spreadsheets, delayed ' +
          'reports. He replaced it with automated Power BI dashboards giving CIRCLE leadership ' +
          'and the funder’s monitoring team real-time visibility into enrollment, completion, ' +
          'skill scores, and business-creation outcomes — plus the data pipelines feeding them ' +
          'and the reporting SOPs that made it repeatable. Reporting time fell 40%; resource ' +
          'allocation improved 20%.',
        'The stack — Power BI, SQL, Google Sheets automation — was chosen deliberately so ' +
          'CIRCLE’s own team could maintain it without him. The dashboards kept running after ' +
          'he left. The infrastructure outlasted the operator; eight months produced a ' +
          'permanent upgrade.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Did Ali Ahmed work at the Gates Foundation?',
      answer:
        'No — and he never claims to. The Bill & Melinda Gates Foundation funded the Digital ' +
        'Literacy Program; CIRCLE Women Association implemented it; Ali was CIRCLE’s Program ' +
        'Manager & Business Intelligence Lead. The honest framing: trusted to deliver a Gates ' +
        'Foundation–backed programme.',
    },
    {
      question: 'What happened to the BI system after he left?',
      answer:
        'It kept running. Ali deliberately built on tools CIRCLE’s own team could maintain — ' +
        'Power BI, SQL, and Google Sheets automation — and documented the reporting workflows ' +
        'as standard operating procedure, so the dashboards and pipelines survived his ' +
        'departure.',
    },
  ],
  related: [
    { slug: 'startup-ecosystem', label: 'Startup ecosystem — national-scale programme delivery' },
    { slug: 'cognilium', label: 'Cognilium AI — where the data discipline went next' },
  ],
}
