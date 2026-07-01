# Identity — source of truth + Wikidata sheet

> **This is the master identity record.** `src/lib/content/profile.ts` is the code source of truth;
> this doc mirrors it in human form and is the copy-paste sheet for the off-site records
> (Wikidata, LinkedIn, etc.). **Rule: change `profile.ts` → propagate the SAME values everywhere.**
> Keep it byte-identical — trivial mismatches (a wrong handle, an old title) suppress entity fusion.

## Canonical identity block (must be identical on every surface)

| Field | Value |
|---|---|
| Name | **Ali Ahmed** *(never "Ahmad")* |
| Handle | **alioahmed** *(X fell back to `Alioahmed_`)* |
| Title | **AI Solutions Engineer** |
| Employer | **Cognilium AI** (+ Head of Product & Platforms @ **Bijli Bachao**) |
| Location | **Lahore, Pakistan** |
| ORCID | **0009-0007-4265-3295** |
| Website | `<YOUR-DOMAIN>` *(flip from `alioahmed.vercel.app` when the domain is chosen)* |
| Wikidata QID | `Q________` *(fill in once created, then add to `PROFILES` in profile.ts + `WIKIDATA_QID` env)* |

---

## Wikidata item — ready-to-fill sheet

Create at <https://www.wikidata.org> → log in → **Create a new item**.
- **Label:** `Ali Ahmed`
- **Description:** `Pakistani AI solutions engineer` *(this is what disambiguates you in lists — keep it short and specific)*
- **Also known as (aliases):** `alioahmed`

Then add each statement below. For **Q-value** rows, type the term in the value box and pick the
matching item from the dropdown (don't hand-type Q-numbers you're unsure of — the ones marked
"confirmed" are safe). For each statement, add a **reference** → `reference URL (P854)` = the source.

| # | Statement | Property | Value to enter | Reference URL (P854) |
|---|---|---|---|---|
| 1 | instance of | **P31** | **human** → `Q5` *(confirmed)* | — |
| 2 | sex or gender | **P21** | **male** → `Q6581097` *(confirmed)* | — |
| 3 | country of citizenship | **P27** | **Pakistan** → `Q843` *(confirmed)* | — |
| 4 | given name | **P735** | search **"Ali"** | — |
| 5 | family name | **P734** | search **"Ahmed"** | — |
| 6 | occupation | **P106** | search **"software engineer"** (+ add **"product manager"** as a 2nd value) | your website / LinkedIn |
| 7 | employer | **P108** | search **"Cognilium AI"** — *if no item exists, skip this row for now (see note) and rely on #10 website + occupation* | cognilium.ai / LinkedIn |
| 8 | educated at | **P69** | search **"University of Central Punjab"** | ucp.edu.pk |
| 9 | languages spoken/written | **P1412** | **English** → `Q1860` *(confirmed)*; **Urdu** → `Q1617` | — |
| 10 | residence / work location | **P937** (work location) | search **"Lahore"** (`Q11739`) | — |
| 11 | official website | **P856** | `<YOUR-DOMAIN>` | (the site itself) |
| 12 | ORCID iD | **P496** | `0009-0007-4265-3295` | https://orcid.org/0009-0007-4265-3295 |
| 13 | LinkedIn personal profile ID | **P6634** | `alioahmed` | https://www.linkedin.com/in/alioahmed/ |
| 14 | GitHub username | **P2037** | `alioahmed` | https://github.com/alioahmed |
| 15 | X username | **P2002** | `Alioahmed_` | https://x.com/Alioahmed_ |

**Notes / honest caveats**
- **Q-values:** only `Q5` (human), `Q6581097` (male), `Q843` (Pakistan), `Q1860` (English), `Q1617`
  (Urdu), `Q11739` (Lahore) are given as codes because they're stable/famous. For occupation,
  employer, university, given/family name — **search by name** and pick the matching item; do not
  guess a QID.
- **Employer (P108):** Cognilium AI likely has **no Wikidata item yet**. Options: (a) skip P108
  for now — occupation + website + LinkedIn already establish the professional identity; or (b)
  create a minimal item for "Cognilium AI" first (label + description "AI engineering company" +
  official website), then reference it. Don't block the personal item on this.
- **References matter:** an item with sourced statements (ORCID page, your site, LinkedIn) is far
  less likely to be challenged. Add `reference URL (P854)` on statements 6, 7, 8, 11–15.
- **Notability is low, not zero:** your ORCID + company role + published profiles are solid grounds,
  but a non-public individual's item can occasionally be flagged. If it is, add more independent
  references. It's still worth doing — it's the #1 entity-fusion lever for a common name.

**After it's live:** put the QID at the **top of `PROFILES`** in `profile.ts` (so it leads `sameAs`),
set `WIKIDATA_QID` in the env, fill the QID into the block above, and run `npm run check:entity`.

---

## Propagation checklist — when identity changes

Any time you edit an identity field in `src/lib/content/profile.ts` (title, domain, a handle, a new
profile), propagate the **same** value to:

- [ ] The site JSON-LD (automatic — it reads `profile.ts`)
- [ ] **Wikidata** (the statement above — e.g. new profile → new identifier property + `sameAs`)
- [ ] **LinkedIn** (the hub) + the specific profile that changed
- [ ] `docs/IDENTITY.md` (this block)
- [ ] Run **`npm run check:entity`** to confirm the site and Wikidata agree

Cadence: identity is **event-driven** (rarely changes) — update on a real change. The weekly
`check:entity` drift-check is the safety net that catches accidental divergence.
