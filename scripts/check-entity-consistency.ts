/**
 * check-entity-consistency.ts — keeps the OFF-SITE entity record (Wikidata) in sync with the
 * on-site source of truth (src/lib/content/profile.ts). Read-only; no auth (Wikidata public API).
 *
 * Dormant until WIKIDATA_QID is set (env). Once set, it fetches the item and flags any drift in
 * name, ORCID, website, and the LinkedIn/GitHub/X handles vs profile.ts. Advisory (exit 0) — it
 * tells you the day the two diverge so you can fix Wikidata (a manual, human-account task).
 *
 * Run: `npm run check:entity`  ·  Wire into the weekly SEO cron.
 */

import { PROFILE, PROFILES } from '@/lib/content'
import { SITE_URL } from '@/lib/site'

const QID = process.env.WIKIDATA_QID?.trim()

function handleFor(key: string): string | undefined {
  return PROFILES.find((p) => p.key === key)?.handle
}

/** Expected values, derived from the on-site source of truth. */
const EXPECTED = {
  name: PROFILE.name,
  orcid: handleFor('orcid'), // the bare ORCID id
  website: SITE_URL,
  linkedin: handleFor('linkedin'),
  github: handleFor('github'),
  x: handleFor('x'),
}

/** Pull the first claim value for a property from a Wikidata entity's claims. */
function claim(entity: Record<string, any>, prop: string): string | undefined {
  const c = entity?.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value
  if (c == null) return undefined
  return typeof c === 'string' ? c : (c.id ?? c.text ?? JSON.stringify(c))
}

async function main() {
  if (!QID) {
    console.log(
      '::notice::[check-entity] WIKIDATA_QID not set — dormant. Create the Wikidata item ' +
        '(see docs/IDENTITY.md), then set WIKIDATA_QID to enable the drift check.',
    )
    process.exit(0)
  }

  console.log(`[check-entity] fetching Wikidata ${QID} …`)
  let entity: Record<string, any>
  try {
    const res = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${QID}.json`)
    if (!res.ok) {
      console.log(`::warning::[check-entity] Wikidata fetch ${QID} → ${res.status}. Skipping.`)
      process.exit(0)
    }
    const json = (await res.json()) as { entities: Record<string, Record<string, any>> }
    entity = json.entities?.[QID]
    if (!entity) throw new Error('entity not found in response')
  } catch (e) {
    console.log(`::warning::[check-entity] could not read Wikidata: ${(e as Error).message}`)
    process.exit(0)
  }

  const actual = {
    name: entity.labels?.en?.value as string | undefined,
    website: claim(entity, 'P856'),
    orcid: claim(entity, 'P496'),
    linkedin: claim(entity, 'P6634'),
    github: claim(entity, 'P2037'),
    x: claim(entity, 'P2002'),
  }

  const drift: string[] = []
  const cmp = (label: string, exp?: string, act?: string, exact = true) => {
    if (!exp) return
    if (act == null) {
      drift.push(`${label}: MISSING on Wikidata (expected "${exp}")`)
    } else if (exact ? act !== exp : !act.includes(exp)) {
      drift.push(`${label}: Wikidata "${act}" ≠ profile.ts "${exp}"`)
    }
  }

  cmp('name (label)', EXPECTED.name, actual.name)
  cmp('website (P856)', EXPECTED.website, actual.website, false)
  cmp('ORCID (P496)', EXPECTED.orcid, actual.orcid)
  cmp('LinkedIn (P6634)', EXPECTED.linkedin, actual.linkedin)
  cmp('GitHub (P2037)', EXPECTED.github, actual.github)
  cmp('X (P2002)', EXPECTED.x, actual.x)

  if (drift.length === 0) {
    console.log('[check-entity] OK — Wikidata matches profile.ts on name, website, ORCID, and handles.')
  } else {
    console.log(`::warning::[check-entity] ${drift.length} drift(s) — update Wikidata to match:`)
    drift.forEach((d) => console.log(`  ⚠ ${d}`))
  }
  process.exit(0) // advisory — never fails the build
}

main()
