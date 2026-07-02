/**
 * CASE_STUDIES — the deep-dive work pages (/work/[slug]), ordered as they appear on /work.
 * One file per slug so each page carries its own honest git-derived freshness date.
 * Every entry compiles from its canonical/*.md — see each file's header for the source + rules.
 */

import type { CaseStudy } from '@/lib/types'
import { COGNILIUM } from './cognilium'
import { PARALEGENT } from './paralegent'
import { BIJLI_BACHAO } from './bijli-bachao'
import { WONDER_WOMEN } from './wonder-women'
import { STARTUP_ECOSYSTEM } from './startup-ecosystem'
import { CIRCLE_GATES } from './circle-gates'
import { BUILD_BUY_SOFTWARE } from './build-buy-software'

export const CASE_STUDIES: CaseStudy[] = [
  COGNILIUM,
  PARALEGENT,
  BIJLI_BACHAO,
  WONDER_WOMEN,
  STARTUP_ECOSYSTEM,
  CIRCLE_GATES,
  BUILD_BUY_SOFTWARE,
]

/** Featured on the home page (the three flagship chapters). */
export const FEATURED_CASE_STUDIES = CASE_STUDIES.filter((cs) => cs.featured)

/** Lookup by slug. */
export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((cs) => cs.slug === slug)
}
