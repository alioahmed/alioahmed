/**
 * OPEN_TO — the recruiter-facing availability block (modes · regions · role lanes).
 * Regions per Ali's brief (2026-07-02): Gulf, US, Australia, Canada, remote-global.
 * NOTE: the BIO variants stay byte-verbatim from BIO-SHEET-ALI.md (they name Gulf/US/Australia);
 * Canada appears only here until the bio sheet is revised.
 */

import type { Availability } from '@/lib/types'

export const OPEN_TO: Availability = {
  headline: 'Open to remote-global roles, relocation, and fractional AI delivery.',
  modes: ['Full-time (remote-global)', 'Relocation', 'Fractional AI-delivery consulting'],
  regions: [
    'Remote (global)',
    'Gulf — UAE · Saudi Arabia · Qatar',
    'United States',
    'Australia',
    'Canada',
  ],
  roles: ['AI Solutions Engineer', 'Forward-Deployed Engineer', 'AI Product Engineer'],
}
