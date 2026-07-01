/**
 * INSTITUTIONS — the institutional spine ("the names behind his face"). Drives the trust bar.
 * Sourced from canonical/00-WHO-ALI-IS.md §4 and the company chapters.
 *
 * GUARDRAILS: relationships are framed honestly — "trusted to deliver … programmes" for
 * Gates/UNIDO (delivered via CIRCLE / Digitara, never employed by them); enterprises are
 * partners/clients earned at Wonder Women. Never "ex-Gates / ex-UNIDO".
 */

import type { Institution } from '@/lib/types'

export const INSTITUTIONS: Institution[] = [
  {
    name: 'Bill & Melinda Gates Foundation',
    short: 'Gates Foundation',
    kind: 'funder',
    relationship: 'Trusted to deliver a Gates Foundation–backed programme (via CIRCLE).',
  },
  {
    name: 'UNIDO (United Nations)',
    short: 'UNIDO · UN',
    kind: 'un',
    relationship: 'Trusted to run outreach for a UNIDO programme (via Digitara).',
  },
  {
    name: 'European Union',
    short: 'European Union',
    kind: 'government',
    relationship: 'Programme backer alongside UNIDO.',
  },
  {
    name: 'GIZ (German federal government)',
    short: 'GIZ',
    kind: 'government',
    relationship: 'Consultancy with the German federal development agency.',
  },
  {
    name: 'Procter & Gamble',
    short: 'P&G',
    kind: 'enterprise',
    relationship: 'Closed as a corporate partner at Wonder Women (#AlwaysAsani).',
  },
  {
    name: 'Engro',
    short: 'Engro',
    kind: 'enterprise',
    relationship: 'Enterprise customer at Wonder Women.',
  },
  {
    name: 'Aga Khan University Hospital',
    short: 'Aga Khan',
    kind: 'hospital',
    relationship: 'Largest single Asani deployment at Wonder Women.',
  },
  {
    name: 'NETSOL Technologies',
    short: 'NETSOL',
    kind: 'enterprise',
    relationship: 'Enterprise customer at Wonder Women.',
  },
]

/** Short labels for a compact logo/trust bar. */
export const TRUST_BAR: string[] = INSTITUTIONS.map((i) => i.short ?? i.name)
