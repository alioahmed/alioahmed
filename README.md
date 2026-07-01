# Ali Ahmed — personal site

Personal site for **Ali Ahmed** — AI Solutions Engineer. Next.js 16 (App Router) on Vercel,
built as a strong, SEO/GEO/AEO-first foundation. Content pages are added on top of this base.

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first `@theme` in `src/app/globals.css`; no `tailwind.config.js`)
- ESLint (flat config) + Prettier
- `next/font` (Inter + Geist Mono) · `next/image` · `next/og` (generated OG + icons)
- Deployed on Vercel

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # typecheck + lint + build
npm run validate:jsonld http://localhost:3000   # run while dev server is up
```

Copy `.env.example` → `.env.local` and fill in optional keys (analytics, IndexNow, verification).

### SEO/GEO/AEO ops scripts

A sitemap-driven operations toolkit lives in `scripts/` (TypeScript via `tsx`). Enable the
freshness pre-push hook once after cloning:

```bash
git config core.hooksPath .githooks   # regenerates src/.generated/page-dates.json before push
npm run gen:page-dates                 # git-derived per-page dates → sitemap lastmod / JSON-LD
npm run gen:llms-full                  # public/llms-full.txt (full personal-brand corpus)
```

Pre-launch audits (build + `npm run start` first, then):

```bash
npm run check:growth                   # jsonld-validity + answer-structure + internal-links + freshness-drift
npm run seo:audit                      # meta / H1 / OG / JSON-LD / canonical inventory
npm run seo:canonicals && npm run seo:og-images
```

Submission/reporting scripts (`seo:indexnow`, `seo:submit`, `seo:report`, `seo:bing`,
`seo:ga4-vitals`, `check:indexing-drift`) are DORMANT until deploy + credentials — each no-ops
with a clear notice when its secret is absent. See `.env.example` and `AGENTS.md` for the full list.

## What's here (the base)

- **SEO/GEO/AEO core** — `src/lib/schema.ts` (Person + ProfilePage + WebSite + Organization
  `@graph` with stable `@id` anchors; this is the entity-fusion engine), `src/lib/metadata.ts`
  (`createMetadata()`), `robots.ts`, `sitemap.ts`, `manifest.ts`, generated `opengraph-image`/
  `icon`/`apple-icon`, `api/indexnow`, `public/llms.txt`.
- **Design system** — one clean token set in `globals.css`; cva primitives in `src/components/ui/`.
- **Identity data** — `src/lib/site.ts` + `src/lib/person.ts` (sourced from the canonical bio,
  honoring all truth-discipline guardrails). Update `sameAs` profiles there.

## Not here yet (content phase)

Real pages (work / about / services / contact / writing), final palette + fonts, real OG art,
the Wikidata item for `sameAs`, and the custom domain.

## Notes

- The previous (v1) site is archived under `_legacy/` for content migration; it is excluded from
  the build, lint, and types.
- Set `NEXT_PUBLIC_SITE_URL` in production so canonical/sitemap/schema use the real origin.
