# AGENTS — alioahmed

Personal site of **Ali Ahmed**. This file is the working brief for any agent editing this repo.

## Identity & truth discipline (non-negotiable)

Source of truth: `../canonical/00-WHO-ALI-IS.md` and `../BIO-SHEET-ALI.md`. Honor every guardrail:

- Title is **AI Solutions Engineer** (workhorse). Never "Founder/CEO of Cognilium" — that is
  Mudassir's. Ali co-founded Wonder Women; that founder title is his.
- Name is always **Ali Ahmed** (never "Ahmad"). Handle is always **alioahmed**.
- Never "solo / sole / single-handed" → use led / owned / drove / built / shipped.
- Never "ex-Gates / ex-UNIDO" → "trusted to deliver … programmes".
- Never a precise Bijli Bachao megawatt figure (cap "~3 MW and growing").
- Never the public words "vibe coding"; never claim from-scratch SWE/ML engineer depth.
- Keep all three dimensions visible in any framing: **builds it · sells & runs it · trusted by**.

Every outward-facing string flows from `src/lib/content/*` (esp. `profile.ts`) + `src/lib/site.ts`.
Edit there, not inline.

**Identity is ONE source of truth → mirror it everywhere (byte-identical).** `src/lib/content/profile.ts`
is canonical; the site JSON-LD, Wikidata, LinkedIn, and every profile must match it exactly (a wrong
handle or stale title suppresses entity fusion). When you change an identity field (title / domain /
a handle / a new profile), propagate the SAME value to Wikidata + LinkedIn + the changed profile, and
run `npm run check:entity`. Master sheet + Wikidata create-spec: **`docs/IDENTITY.md`**.

## Design system (Stripe-inspired — follow it, don't reinvent)

Full spec: **`docs/DESIGN.md`**. Implemented as ONE token system in `src/app/globals.css` `@theme`.
Register: financial-infrastructure polish — deep-navy ink, ONE electric-indigo CTA, atmospheric
gradient mesh on heroes, thin (300) display type with negative tracking, tabular figures for numbers.

- **Palette:** `--color-ink` `#0d253d` (never pure black), `--color-accent` `#533afd` (the only CTA
  colour — one filled indigo pill per band; hover→`accent-hover`, press→`accent-press`). Navy family
  for text (`body`/`muted`/`faint`, all WCAG-AA on canvas + surface). `brand-dark` = dark card fill.
  Gradient-only accents (`ruby`/`magenta`) are NEVER buttons.
- **Type:** display tiers are `.text-display-{xxl,xl,lg,md}` + `.text-lead` + `.eyebrow` (defined in
  globals). Display is **weight 300 + negative tracking** — the signature; never bump above 300.
  Body is 400. Numerics use `tabular-nums`. `ss01` is on globally. Inter is the Sohne substitute.
- **Shape/elevation:** all buttons + tags are pills (`--radius-full`); cards `--radius-featured` (12px).
  Shadows are blue-tinted (`--shadow-level-*`), used sparingly.
- **Signature mesh:** `<GradientMesh>` / `Section mesh` — layered radial-gradients (`.gradient-mesh`),
  masked to fade into canvas. Heroes get it; bare-canvas heroes are off-brand.
- **Primitives** (compose, never restyle inline): `Button` (primary/secondary/outline/dark/ghost/link),
  `Cta` (accent/secondary/dark/outline pill+arrow), `Card`, `Pill`, `Section`/`SectionHeading`,
  `StatTile`, `Container`, `GradientMesh`.

## Tech rules

- Next.js 16 App Router; **Server Components by default**, `'use client'` only at interactive leaves.
- Tailwind v4 CSS-first: tokens live in `src/app/globals.css` `@theme`. **No raw hex in JSX** —
  use the token utilities (`bg-accent`, `text-ink`, `rounded-card`…). The accent is one variable.
- Compose from `src/components/ui/` primitives; never restyle a primitive inline.
- TypeScript strict (no `any`, no `@ts-ignore`); `next/image` only; one `priority` LCP image/page.
- Every page: `createMetadata()` for metadata; add a per-page `WebPage`/`ProfilePage` schema node.
- Never claim a task done without `npm run check` passing. Commit/push only when Ali says so.

## SEO/GEO baseline (already wired — extend, don't rebuild)

`schema.ts` graph, `metadata.ts`, `robots.ts` (allow-all), `sitemap.ts` (real per-route dates —
never fake-uniform), `manifest.ts`, generated OG/icons, `api/indexnow`, `llms.txt`.

## Mobile-first (production-grade — non-negotiable)

Design for the phone first, add `sm:`/`md:`/`lg:` upward. Never author desktop-first.

- **Units:** full-height sections use `min-h-svh` (NOT `min-h-screen`/`100vh` — the mobile-toolbar bug).
- **Touch targets:** primary controls ≥44px (`Button`/`Cta` md = `h-11`). Small text-link clusters get
  `min-h-9 min-w-11` hit areas. Never ship a tap target < 24px.
- **Safe-area:** `viewport-fit: cover` is set; apply `.pt-safe`/`.pb-safe` to sticky/fixed edges and use
  the `.px-gutter` container class (safe-area-aware responsive padding). Raw `env()` only with `max()`.
- **No horizontal scroll:** no fixed px widths; `@layer base` guards (`img/video max-w`, `*{min-width:0}`,
  `html{overflow-x:clip}`) are in globals.css — keep them. Test at 360/375/390 px, portrait + landscape.
- **Zoom stays ON** (a11y): never set `maximumScale`/`userScalable`. Inputs are ≥16px on touch (no iOS zoom).
- **Nav:** mobile uses the accessible `MobileMenu` drawer (focus-trap, Escape, scroll-lock, `role=dialog`).
- **Images (content phase):** `next/image` with explicit `sizes` + `priority` on the LCP image.
- **Test mobile, not just desktop:** run Lighthouse `--form-factor=mobile`. Targets: LCP ≤2.5s (field),
  INP ≤200ms, CLS ≤0.1. Verify no horizontal scroll and the drawer is keyboard/SR usable.

## Known stack decisions (don't "fix" these)

- **ESLint is pinned to 9, not 10.** ESLint 10 removed `context.getFilename`, which the
  `eslint-plugin-react` bundled inside `eslint-config-next` still calls — it crashes on 10.
  Stay on ESLint 9 until the Next plugin ships an ESLint-10-compatible react plugin.
- **`overrides.postcss` forces `^8.5.16`.** Next 16 bundles postcss `8.4.31` internally, which
  `npm audit` flags (GHSA-qx2v-qp2m-jg93). The override patches it everywhere → `npm audit` = 0.
  Do NOT run `npm audit fix --force` — it tries to install `next@9` and destroys the project.
- **`@emnapi/*` / `@napi-rs/wasm-runtime` show as `extraneous`** in `npm ls` — they're Tailwind/
  lightningcss optional WASM runtimes, reinstalled every time. Harmless; not removable cruft.
- **React Compiler is OFF** and **`cacheComponents` is OFF** — static rendering already gives bots
  fully server-rendered HTML (the only crawlability requirement). Enable `cacheComponents: true`
  (Next 16's unified PPR + `use cache` + dynamicIO) only when real dynamic/cached content is added;
  it adds build-time strictness (uncached data outside `<Suspense>` throws). See `docs/DISCOVERABILITY.md`.
- Node `>=20.9.0` (engines). Latest stable line: Next 16.2.9 · React 19.2.7 · TS 6 · Tailwind v4.
- **Discoverability/growth playbook: `docs/DISCOVERABILITY.md`** — the SEO/GEO/AI-bot base (done)
  + the off-site citation engine (the real growth lever). Read before any SEO work.

## SEO/GEO/AEO operations scripts (`scripts/`)

Ported from the production Bloom-n-Beyond ops system, adapted to a person (no commerce).
All scripts are TypeScript run via `npx tsx` (`tsx` is a devDependency). Page discovery is
**sitemap-driven** (`scripts/lib/pages.ts` `getAuditPages()` reads sitemap.xml) — never a
hardcoded route list — so it scales as content pages ship. Central config: `scripts/lib/config.ts`
(site origin/host from `NEXT_PUBLIC_SITE_URL`; all keys/creds read from env, dormant when absent).

Freshness pipeline (the crown jewel — dates are GIT-DERIVED, never blanket "today"):

- `npm run gen:page-dates` → `src/.generated/page-dates.json` (last material commit date per file).
  This file IS committed (build input for Vercel's shallow clone). `src/lib/page-dates.ts` reads it;
  `src/lib/content/dates.ts` `pageDates()` returns git dates (falls back to `CONTENT_LAST_MODIFIED`).
- `npm run check:last-updated` guards the wiring chain (git → json → page-dates.ts → dates.ts → sitemap).
- `npm run check:freshness-drift` (needs a running server) — JSON-LD `dateModified` + sitemap agree.
- Enable the pre-push hook once after cloning: **`git config core.hooksPath .githooks`**
  (regenerates the snapshot before push; aborts-and-stages if stale).

Pre-launch audits (run against a built + running server, or production):

- `check:jsonld-validity` · `check:answer-structure` · `check:internal-links` · `seo:audit[:full]`
  (schema/meta/H1/OG/CWV/links) · `seo:canonicals` · `seo:og-images` · `seo:images` · `seo:metadata`.
- `npm run check:growth` runs the four localhost gates together.
- `npm run gen:llms-full` → `public/llms-full.txt` (full personal-brand corpus from the content layer).

Dormant until deploy + credentials (each no-ops with a clear `::notice::` when its secret is absent):

- `seo:indexnow` / `indexnow:on-change` (need an IndexNow key), `seo:submit` / `seo:report`
  (GSC service account), `seo:bing` (BING_API_KEY), `seo:ga4-vitals` / `seo:verify-sa`
  (GA4 + service account), `check:indexing-drift`. See `.env.example` for every dormant var.

CI: `.github/workflows/freshness.yml` (PR/push gate), `indexing-drift.yml` + `seo-audit-weekly.yml`
(Sunday crons; no-op without secrets). Do not hardcode any key — all come from env/secrets.

## Layout

`src/app` (routes + SEO file-routes) · `src/lib` (types, site, schema, metadata, utils + `content/`
data layer) · `src/components` (ui, layout, seo, analytics) · `scripts` (JSON-LD validators) ·
`_legacy` (archived v1).
