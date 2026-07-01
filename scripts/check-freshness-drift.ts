#!/usr/bin/env tsx
/**
 * Freshness-drift validator — runs against a built + running Next.js server.
 *
 * Why: when a URL's freshness signals disagree — visible "Last updated" date,
 * JSON-LD `dateModified`, OG `article:modified_time`, and sitemap `<lastmod>` —
 * Google may suppress the SERP date entirely (Search Central: "Add a Byline
 * Date"). check-last-updated.ts guards the SOURCE wiring; this checks that what
 * reaches the wire actually agrees, on a small representative sample.
 *
 * Adapted for the profile site: the sample + expected surfaces come from
 * config (SAMPLE_PAGES). The home route emits JSON-LD dateModified (WebPage)
 * and sitemap lastmod, both from pageDates() — so they must agree. No page
 * emits OG article:modified_time yet (metadata.ts has no article time), and no
 * visible "Last updated" line exists yet; those surfaces are only ASSERTED when
 * a page is declared to emit them.
 *
 * Usage:
 *   npx tsx scripts/check-freshness-drift.ts                    # http://localhost:3000
 *   BASE_URL=https://alioahmed.com npx tsx scripts/check-freshness-drift.ts
 *
 * Exit: 0 = all expected signals present & agreeing · 1 = drift · 2 = crash.
 */

import { fetchWithRetry } from "./lib/fetcher";
import { parseSitemapEntries } from "./lib/sitemap-parser";
import { SAMPLE_PAGES } from "./lib/config";

const BASE_URL = process.env.BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

type Surface = "visible" | "jsonLd" | "og" | "sitemap";
interface SampleSpec {
  path: string;
  expect: ReadonlyArray<Surface>;
}

/* Per-route expected surfaces. The home page emits WebPage JSON-LD dateModified
   + sitemap lastmod (both derived from pageDates('/')). Add richer expectations
   (visible / og) as content pages that emit them ship. Routes without an
   explicit spec default to sitemap-only. */
const EXPECTED: Record<string, ReadonlyArray<Surface>> = {
  "/": ["jsonLd", "sitemap"],
};

const SAMPLE_URLS: ReadonlyArray<SampleSpec> = SAMPLE_PAGES.map((path) => ({
  path,
  expect: EXPECTED[path] ?? ["sitemap"],
}));

interface Extracted {
  url: string;
  status: number;
  visibleDate: string | null;
  jsonLdModified: string | null;
  ogModified: string | null;
  sitemapModified: string | null;
}

const VISIBLE_RE =
  /Last updated:(?:\s|<!--[\s\S]*?-->)*([0-9]{1,2}\s+[A-Z][a-z]+\s+[0-9]{4})/;

function extractJsonLdDateModified(html: string): string | null {
  const blockRe = /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html)) !== null) {
    try {
      const json = JSON.parse(m[1]);
      const found = findKeyDeep(json, "dateModified");
      if (typeof found === "string") return found;
    } catch {
      /* malformed JSON — schema validator catches these */
    }
  }
  return null;
}

function findKeyDeep(obj: unknown, key: string): unknown {
  if (obj === null || typeof obj !== "object") return undefined;
  if (Array.isArray(obj)) {
    for (const el of obj) {
      const r = findKeyDeep(el, key);
      if (r !== undefined) return r;
    }
    return undefined;
  }
  const rec = obj as Record<string, unknown>;
  if (key in rec) return rec[key];
  for (const v of Object.values(rec)) {
    const r = findKeyDeep(v, key);
    if (r !== undefined) return r;
  }
  return undefined;
}

const OG_META_RE = /<meta\b[^>]*\bproperty\s*=\s*["']article:modified_time["'][^>]*>/i;
const OG_CONTENT_RE = /\bcontent\s*=\s*["']([^"']+)["']/i;

function extractOgModified(html: string): string | null {
  const tag = html.match(OG_META_RE);
  if (!tag) return null;
  const content = tag[0].match(OG_CONTENT_RE);
  return content ? content[1] : null;
}

async function fetchUrl(path: string): Promise<{ status: number; html: string }> {
  const res = await fetchWithRetry(
    `${BASE_URL}${path}`,
    { redirect: "follow", headers: { "User-Agent": "alioahmed-drift-validator/1.0" } },
    { maxRetries: 1, timeout: 15000 },
  );
  return { status: res.status, html: await res.text() };
}

async function buildSitemapMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const entries = await parseSitemapEntries(BASE_URL);
  for (const e of entries) {
    if (!e.lastmod) continue;
    const path = e.loc.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "") || "/";
    map.set(path, e.lastmod);
  }
  return map;
}

/* Normalise any date representation to a calendar-day key (UTC). Calendar-day
   mismatch is the real SERP risk; sub-day differences are irrelevant. */
function toDayKey(input: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const iso = new Date(trimmed);
  if (!Number.isNaN(iso.getTime())) {
    return iso.toLocaleString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    });
  }
  const m = trimmed.match(/^(\d{1,2})\s+([A-Z][a-z]+)\s+(\d{4})$/);
  if (m) {
    const d = new Date(`${m[1]} ${m[2]} ${m[3]} 12:00:00 GMT+0000`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC",
      });
    }
  }
  return null;
}

async function main(): Promise<void> {
  console.log(`[check-freshness-drift] BASE_URL=${BASE_URL}`);
  const sitemapMap = await buildSitemapMap();
  console.log(`[check-freshness-drift] sitemap.xml: ${sitemapMap.size} URLs indexed`);

  let failures = 0;
  console.log("");
  for (const spec of SAMPLE_URLS) {
    const { status, html } = await fetchUrl(spec.path);
    const row: Extracted = {
      url: spec.path,
      status,
      visibleDate: html.match(VISIBLE_RE)?.[1] ?? null,
      jsonLdModified: extractJsonLdDateModified(html),
      ogModified: extractOgModified(html),
      sitemapModified: sitemapMap.get(spec.path) ?? null,
    };
    const days = {
      visible: toDayKey(row.visibleDate),
      jsonLd: toDayKey(row.jsonLdModified),
      og: toDayKey(row.ogModified),
      sitemap: toDayKey(row.sitemapModified),
    };

    const missing = spec.expect.filter((surface) => days[surface] === null);
    const presentDays = spec.expect
      .map((surface) => days[surface])
      .filter((v): v is string => v !== null);
    const distinctValues = new Set(presentDays);

    const ok = status === 200 && missing.length === 0 && distinctValues.size <= 1;

    console.log(`  ${ok ? "OK  " : "FAIL"} ${spec.path}  [status ${status}]`);
    console.log(
      `        visible=${days.visible ?? "—"}  jsonLd=${days.jsonLd ?? "—"}  og=${days.og ?? "—"}  sitemap=${days.sitemap ?? "—"}`,
    );
    if (missing.length > 0) console.log(`        expected but missing: ${missing.join(", ")}`);
    if (!ok) failures++;
  }

  console.log("");
  if (failures > 0) {
    console.error(`[check-freshness-drift] FAIL — ${failures}/${SAMPLE_URLS.length} URLs failed.`);
    console.error("  An expected surface is missing, or present surfaces disagree on the day.");
    process.exit(1);
  }
  console.log(
    `[check-freshness-drift] OK — expected signals present & agreeing across ${SAMPLE_URLS.length} sampled URL(s).`,
  );
}

main().catch((err) => {
  console.error(`[check-freshness-drift] crash: ${(err as Error).message}`);
  process.exit(2);
});
