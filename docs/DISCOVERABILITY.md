# Discoverability & Growth Playbook (SEO · GEO · AEO · AI bots)

> Research-backed, July 2026. Tags: **PROVEN** (primary-source / replicated), **EMERGING**,
> **HYPE** (vendor-blog claim, no controlled evidence). The honest headline: on-site work makes
> Ali **legible and disambiguable**; **citations are earned off-site.** Get the base right once,
> then spend the real effort on §B.

---

## A. On-site base — what's shipped and why

The base already implements every PROVEN on-site lever. Don't expect any of these to *drive*
citations alone — they're the necessary plumbing that lets engines understand and trust the entity.

| Lever | Status | File | Evidence |
|---|---|---|---|
| Clean, fast, **server-rendered HTML** (RSC, static) | ✅ | `src/app/*` | PROVEN — AI retrieval needs crawlable HTML; #1 substrate |
| **robots** allows all retrieval + training bots | ✅ | `app/robots.ts` | PROVEN — being known is the goal |
| **Sitemap** with honest per-route `lastmod` (no priority/changefreq) | ✅ | `app/sitemap.ts` | PROVEN — Google ignores priority/changefreq; blanket dates kill lastmod trust |
| **JSON-LD `@graph`**: Person + ProfilePage + WebSite + Organization, `@id`-wired | ✅ | `src/lib/schema.ts` | PROVEN for Google entity understanding |
| **`sameAs`** → 20 verified profiles incl. ORCID/LinkedIn/X + ORCID `identifier` | ✅ | `src/lib/content/profile.ts` | PROVEN — top disambiguation signal |
| **Generated OG/icons** via next/og (never a broken og:image) | ✅ | `app/opengraph-image.tsx` | PROVEN — controls AI/social link previews |
| **Freshness alignment** dateModified ↔ sitemap lastmod | ✅ | `dates.ts` + schema | PROVEN — live-retrieval favors fresh, honest dates |
| **IndexNow** route (Bing/Yandex speed) | ✅ | `app/api/indexnow/route.ts` | PROVEN mechanism; **Google does NOT consume it** |
| **Verification** env (Google/Bing/Yandex) | ✅ | `app/layout.tsx` | enables GSC/Bing/Yandex |
| **llms.txt** + **llms-full.txt** (cheap hedge) | ✅ | `public/llms.txt`, `public/llms-full.txt` (`gen:llms-full`) | **HYPE** for citations — no confirmed AI-search consumption; kept as cheap optionality only, expect no lift |

**Deliberately NOT done (HYPE / restrictive / not-for-visibility):** Speakable schema, LocalBusiness
schema, `ai.txt`/RSL/TDMRep/Cloudflare-blocking (those *restrict* access — opposite of the goal).
`cacheComponents` is OFF (static rendering already gives bots full HTML; enable it only when
dynamic/cached content is added).

### On-site to-do when pages exist (content phase)
- Per-page `generateMetadata` (await `params`) + `alternates.canonical` on every page.
- `generateStaticParams` for any `[slug]` route → prerender into the static shell.
- Per-post `Article`/`BlogPosting` JSON-LD with `author` → `#person`; per-route `opengraph-image`.
- RSS feed at `app/feed.xml/route.ts` advertised via `alternates.types` (conventional value; **not**
  an AI-discovery channel — EMERGING/low).
- Optional `/raw` markdown endpoints — help coding agents (~80% fewer tokens), **not** a citation
  driver (PROVEN: no AI indexing crawler content-negotiates markdown).
- Keep content in Server Components; never render must-see content client-side in `useEffect`.

---

## B. Off-site — the ACTUAL citation engine (where the growth is)

Every large 2026 dataset agrees: this is what moves AI visibility. Ranked by evidence quality.

1. **Web brand mentions of "Ali Ahmed" by name** — strongest ownable signal (Ahrefs 75K brands:
   ~0.66 correlation, **beats backlinks ~3:1**). Get named across the web. **(PROVEN)**
2. **YouTube presence** — strongest single correlate (~0.74). Be named/featured in videos, podcasts,
   others' channels. **(PROVEN correlation)**
3. **Consistent posting from the personal LinkedIn** — LinkedIn is the #2 most-cited AI domain;
   ~59% of cited LinkedIn content is individual profiles. Consistency > virality (cited posts often
   have 15–25 reactions). **Highest-leverage owned off-site move.** **(PROVEN)**
4. **Reddit / Quora / community answers** — structurally dominant for Perplexity & Google AIO.
   Be genuinely helpful; don't manufacture. **(PROVEN)**
5. **Wikidata entity** (low bar — verify existence via ORCID/registries) with referenced claims +
   canonical URL. Pursue **Wikipedia only if independent coverage already exists.** **(PROVEN)** —
   **#1 open base TODO** (item bookmarked, not created).
6. **Entity consistency** (same name/title/bio/headshot/canonical everywhere) — do it for
   correctness/disambiguation; that it *independently* drives citations is **HYPE-leaning.**

**Ghost-citation nuance (PROVEN):** 61.7% of AI citations link a domain *without naming the brand*;
only 13.2% both cite and name. Being *named* — the personal-brand goal — comes from being the
consensus answer to recommendation queries ("best AI Solutions Engineer for X").

---

## C. Operational checklist (once domain + deploy are live)

- [ ] Create the **Wikidata** item (canonical URL, ORCID, employer, occupation, `sameAs`).
- [ ] Verify in **Google Search Console + Bing Webmaster + Yandex** (env vars already wired).
      Bing access = Copilot + ChatGPT-search + DuckDuckGo eligibility.
- [ ] Submit sitemap to GSC + Bing; submit URL at search.brave.com/submit-url.
- [ ] Wire an **IndexNow ping on deploy** (CI step → `POST /api/indexnow` with changed URLs).
      Bing/Yandex speed only; nothing for Google.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real origin so canonical/sitemap/schema use it.
- [ ] Then: the §B off-site work — that's the growth lever, not the site.

## Crawler reference (allow these retrieval bots — already allowed)
OAI-SearchBot · ChatGPT-User · Claude-SearchBot · Claude-User · PerplexityBot · Googlebot
(**also serves AI Overviews/AI Mode**) · Bingbot (**powers Copilot + ChatGPT-search + DuckDuckGo**)
· Applebot · Amazonbot · DuckAssistBot · Bravebot · YandexBot. Google-Extended only controls Gemini
*training*, not AIO — you cannot opt out of "AI in Search" without leaving Search.
