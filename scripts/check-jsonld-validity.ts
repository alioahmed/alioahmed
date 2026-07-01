#!/usr/bin/env tsx
/**
 * JSON-LD validity checker — runs against a built + running Next.js server.
 *
 * Why this script and not a packaged validator (as of 2026):
 *   - iaincollins/structured-data-testing-tool: last release 2022-05;
 *     ruleset hasn't tracked Google's 2023-2026 Rich Results changes.
 *   - @adobe/structured-data-validator: actively maintained but silently
 *     passes Article, Dataset, FAQPage, LocalBusiness — the four types
 *     we lean on most. Issue #56 confirms.
 *   - Schemar (johnnyreilly/schemar): wraps validator.schema.org's HTTPS
 *     endpoint, so it can't validate a localhost build.
 *
 *   Until one of those covers the gaps, we maintain a small list of
 *   explicit required-field rules per Google's Rich Results docs and
 *   assert against the JSON-LD our build emits. The rule list is short
 *   because we only emit ~12 schema types — adding a new schema is a
 *   2-line edit here.
 *
 * Coverage:
 *   Per-type required fields below mirror the "Required properties" boxes
 *   in https://developers.google.com/search/docs/appearance/structured-data/<type>.
 *   For Article/NewsArticle/BlogPosting we also enforce dateModified, since
 *   our durable freshness pipeline depends on it.
 *
 *   walkSchemaNodes validates every top-level node against its rule. It can
 *   also descend into nodes whose @type is in DEEP_VALIDATE_TYPES (currently
 *   none — a personal profile emits no schema type that Google validates when
 *   nested), so the recursive machinery is retained but dormant.
 *
 * Exit codes:
 *   0 = every JSON-LD block on every sampled URL is valid JSON AND meets
 *       Google Rich Results required-field expectations for its @type.
 *   1 = one or more validation failures (printed with URL + field path).
 */

import { getAuditPages } from "./lib/pages";
import { fetchWithRetry } from "./lib/fetcher";
import { SAMPLE_PAGES } from "./lib/config";

const BASE_URL = process.env.BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

/* Sample URLs spanning the schema types we currently emit (Person, ProfilePage,
   Organization, WebSite, WebPage; plus Article/FAQPage/BreadcrumbList/ItemList
   as content pages ship). Config-driven — keep SAMPLE_PAGES in lockstep with
   what is LIVE, or run with --all to validate every URL in the sitemap. */
const SAMPLE_URLS = SAMPLE_PAGES;

interface Rule {
  /** Required top-level fields per Google Rich Results docs. Each entry
      can be a single key or `a || b || c` (a tuple) to express
      "at least one of". Missing → CI failure. */
  required: ReadonlyArray<string | ReadonlyArray<string>>;
  /** Fields Google labels "recommended". Missing → warning printed but
      no CI failure. Rich-results display may degrade. */
  recommended?: ReadonlyArray<string>;
  /** Nested fields validated when their parent IS present, e.g.
      `offers.price` for Product. */
  nestedRequiredIfPresent?: Record<string, ReadonlyArray<string>>;
}

/* Type→required-field map. Subtypes inherit their parent type's rules
   by being normalised in `effectiveType()` below.

   Each entry distinguishes "required" (Google Rich Results docs say
   "required") from "recommended" (Google docs say "recommended"). Our
   schemas emit recommended fields too, but failing CI when one is
   missing is too aggressive — Rich Results display degrades, it doesn't
   refuse. We log recommended-misses as warnings, fail on required-misses. */
const RULES: Record<string, Rule> = {
  // Article (NewsArticle, BlogPosting, Report): Google requires only headline.
  // image / datePublished / author are "recommended".
  // Our durable freshness pipeline needs dateModified, but it's still
  // a recommendation from Google's side, not a hard requirement.
  Article: {
    required: ["headline"],
    recommended: ["image", "datePublished", "dateModified", "author"],
  },
  Dataset: {
    required: ["name", "description"],
    recommended: ["url", "license"],
  },
  Organization: {
    required: ["name", "url"],
    // sameAs (Trustpilot/GBP/social) is a key entity signal for AI/GEO —
    // research shows ~65-71% of AI-cited pages carry rich Organization data.
    recommended: ["logo", "sameAs"],
  },
  LocalBusiness: {
    required: ["name", "address"],
    // Hours are emitted via openingHoursSpecification (structured form) —
    // both it and the "openingHours" shorthand satisfy Google. Check the
    // one we actually emit so we don't false-warn on valid schema.
    recommended: ["telephone", "openingHoursSpecification", "geo"],
  },
  FAQPage: {
    required: ["mainEntity"],
  },
  BreadcrumbList: {
    required: ["itemListElement"],
  },
  HowTo: {
    required: ["name", "step"],
  },
  Service: {
    required: ["name"],
    recommended: ["provider"],
  },
  VideoObject: {
    /* Google requires AT LEAST ONE of contentUrl / embedUrl; expressed
       inline as an "any-of" required clause (the array form). */
    required: [
      "name",
      "description",
      "thumbnailUrl",
      "uploadDate",
      ["contentUrl", "embedUrl"],
    ],
  },
  ImageObject: {
    required: ["url"],
    recommended: ["caption"],
  },
  WebSite: {
    required: ["name", "url"],
  },
  ItemList: {
    required: ["itemListElement"],
  },
};

/* Map subtype → parent for rule resolution. Schema.org lets you set @type
   to a more specific subtype (NewsArticle, OnlineStore, etc.); for our
   purposes the parent's required fields are what Google enforces. */
const SUBTYPES: Record<string, string> = {
  NewsArticle: "Article",
  BlogPosting: "Article",
  TechArticle: "Article",
  Report: "Article",
};

interface SchemaNode {
  "@type"?: string | string[];
  [key: string]: unknown;
}

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

function effectiveType(t: string): string {
  return SUBTYPES[t] ?? t;
}

function getTypes(node: SchemaNode): string[] {
  const t = node["@type"];
  if (!t) return [];
  return asArray(t).map((x) => (typeof x === "string" ? x : ""));
}

/* Types that Google validates EVEN WHEN NESTED inside another schema.
   Empty for a personal profile: the types we emit (Organization-as-brand,
   ImageObject-as-image, Person-as-author) are *sub-property references* —
   Google doesn't demand standalone-schema completeness on them, so validating
   them nested would false-flag e.g. `brand: { @type: Organization, name }` for
   a missing `url`. Add a type here only if Google validates it inline. */
const DEEP_VALIDATE_TYPES = new Set<string>();

/* Yield every top-level node (full validation against its rule), plus
   any deeply-nested node whose @type is in DEEP_VALIDATE_TYPES.

   Top-level = direct child of the JSON-LD root OR of `@graph`. */
function* walkSchemaNodes(parsed: unknown): Generator<SchemaNode> {
  if (parsed === null || typeof parsed !== "object") return;

  // Collect top-level nodes (root, array members, or @graph entries).
  let topLevel: SchemaNode[];
  if (Array.isArray(parsed)) {
    topLevel = (parsed as unknown[]).filter(
      (e) => e !== null && typeof e === "object",
    ) as SchemaNode[];
  } else {
    const root = parsed as Record<string, unknown>;
    if (Array.isArray(root["@graph"])) {
      topLevel = (root["@graph"] as unknown[]).filter(
        (e) => e !== null && typeof e === "object",
      ) as SchemaNode[];
    } else {
      topLevel = [root as SchemaNode];
    }
  }

  // Pass 1: every top-level node — full validation against all rules.
  for (const node of topLevel) yield node;

  // Pass 2: walk deeply, yielding only nodes whose @type is in
  // DEEP_VALIDATE_TYPES. skipRoot=true on the first call so we don't
  // re-yield top-level nodes we already returned in pass 1.
  for (const node of topLevel) {
    yield* findDeepTyped(node, DEEP_VALIDATE_TYPES, /* skipRoot */ true);
  }
}

function* findDeepTyped(
  node: unknown,
  targets: Set<string>,
  skipRoot: boolean,
): Generator<SchemaNode> {
  if (node === null || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const entry of node) yield* findDeepTyped(entry, targets, false);
    return;
  }
  const obj = node as Record<string, unknown>;
  if (!skipRoot) {
    const types = getTypes(obj as SchemaNode).map(effectiveType);
    if (types.some((t) => targets.has(t))) yield obj as SchemaNode;
  }
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") {
      yield* findDeepTyped(value, targets, false);
    }
  }
}

function isNonEmpty(v: unknown): boolean {
  if (v === null || v === undefined || v === "") return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v as object).length > 0;
  return true;
}

interface Issue {
  url: string;
  type: string;
  severity: "required" | "recommended";
  message: string;
}

function validateNode(url: string, node: SchemaNode, issues: Issue[]): void {
  const types = getTypes(node);
  if (types.length === 0) return;

  for (const rawType of types) {
    const t = effectiveType(rawType);
    const rule = RULES[t];
    if (!rule) continue; // Unknown schema; skip rather than fail noisily.

    for (const requirement of rule.required) {
      if (typeof requirement === "string") {
        if (!isNonEmpty(node[requirement])) {
          issues.push({
            url,
            type: rawType,
            severity: "required",
            message: `missing required field "${requirement}"`,
          });
        }
      } else {
        // "at least one of"
        const present = requirement.some((k) => isNonEmpty(node[k]));
        if (!present) {
          issues.push({
            url,
            type: rawType,
            severity: "required",
            message: `at least one of [${requirement.join(", ")}] required`,
          });
        }
      }
    }

    for (const recommended of rule.recommended ?? []) {
      if (!isNonEmpty(node[recommended])) {
        issues.push({
          url,
          type: rawType,
          severity: "recommended",
          message: `missing recommended field "${recommended}" (rich-results display may degrade but build can ship)`,
        });
      }
    }

    if (rule.nestedRequiredIfPresent) {
      for (const [parent, nestedFields] of Object.entries(
        rule.nestedRequiredIfPresent,
      )) {
        const v = node[parent];
        if (!isNonEmpty(v)) continue;
        const items = Array.isArray(v) ? v : [v];
        for (const item of items) {
          if (item === null || typeof item !== "object") continue;
          const rec = item as Record<string, unknown>;
          for (const f of nestedFields) {
            if (!isNonEmpty(rec[f])) {
              issues.push({
                url,
                type: rawType,
                severity: "required",
                message: `${parent}.${f} required when ${parent} is present`,
              });
            }
          }
        }
      }
    }
  }
}

async function fetchHtml(path: string): Promise<{ status: number; html: string }> {
  const res = await fetchWithRetry(
    `${BASE_URL}${path}`,
    {
      headers: { "User-Agent": "alioahmed-jsonld-validator/1.0" },
      redirect: "follow",
    },
    { maxRetries: 2, timeout: 30000 },
  );
  return { status: res.status, html: await res.text() };
}

function extractJsonLdBlocks(html: string): unknown[] {
  // `\b[^>]*type=` (not `\s+type=`) so blocks with an attribute before type
  // — e.g. <script id="x" type="application/ld+json"> — aren't silently skipped.
  const re = /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  const out: unknown[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      out.push(JSON.parse(m[1]));
    } catch (err) {
      // Parse failures are themselves a failure mode we want to surface.
      out.push({ __parseError: (err as Error).message, __raw: m[1].slice(0, 200) });
    }
  }
  return out;
}

async function main(): Promise<void> {
  console.log(`[check-jsonld-validity] BASE_URL=${BASE_URL}`);
  const issues: Issue[] = [];
  let totalBlocks = 0;

  // Default = curated SAMPLE_URLS (one per schema type — fast, the CI gate).
  // --all = every page in the sitemap (full coverage; new pages auto-included).
  const targets: readonly string[] = process.argv.slice(2).includes("--all")
    ? await getAuditPages()
    : SAMPLE_URLS;
  console.log(`[check-jsonld-validity] validating ${targets.length} URL(s)`);

  for (const url of targets) {
    let status: number;
    let html: string;
    try {
      ({ status, html } = await fetchHtml(url));
    } catch (err) {
      issues.push({
        url,
        type: "(fetch)",
        severity: "required",
        message: `fetch failed: ${(err as Error).message}`,
      });
      console.log(`  FAIL ${url}  [fetch failed: ${(err as Error).message}]`);
      continue;
    }
    if (status !== 200) {
      issues.push({
        url,
        type: "(http)",
        severity: "required",
        message: `HTTP ${status}`,
      });
      continue;
    }
    const blocks = extractJsonLdBlocks(html);
    if (blocks.length === 0) {
      console.log(`  ${url}: no JSON-LD blocks`);
      continue;
    }
    totalBlocks += blocks.length;
    const before = issues.length;
    for (const block of blocks) {
      if (block && typeof block === "object" && "__parseError" in block) {
        issues.push({
          url,
          type: "(parse)",
          severity: "required",
          message: `invalid JSON: ${(block as { __parseError: string }).__parseError}`,
        });
        continue;
      }
      for (const node of walkSchemaNodes(block)) {
        validateNode(url, node, issues);
      }
    }
    const urlIssues = issues.slice(before);
    const urlRequired = urlIssues.filter((i) => i.severity === "required").length;
    const urlRecommended = urlIssues.filter((i) => i.severity === "recommended").length;
    const flag = urlRequired > 0 ? "FAIL" : urlRecommended > 0 ? "WARN" : "OK  ";
    console.log(
      `  ${flag} ${url}  [${blocks.length} block${blocks.length === 1 ? "" : "s"}, ${urlRequired} required-miss, ${urlRecommended} recommended-miss]`,
    );
  }

  // Dedupe: a deep node reachable via two paths can double-report the same
  // issue. Collapse on url+type+message so each distinct problem prints once.
  const seen = new Set<string>();
  const dedupedIssues = issues.filter((i) => {
    const key = `${i.url} ${i.type} ${i.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const required = dedupedIssues.filter((i) => i.severity === "required");
  const recommended = dedupedIssues.filter((i) => i.severity === "recommended");

  console.log("");
  if (recommended.length > 0) {
    console.log(`[check-jsonld-validity] ${recommended.length} recommended-field miss${recommended.length === 1 ? "" : "es"} (warning, not blocking):`);
    for (const r of recommended) {
      console.log(`  - ${r.url}  [${r.type}]  ${r.message}`);
    }
    console.log("");
  }
  if (required.length > 0) {
    console.error(`[check-jsonld-validity] FAIL — ${required.length} required-field issue(s) across ${targets.length} URL(s):`);
    console.error("");
    for (const f of required) {
      console.error(`  - ${f.url}  [${f.type}]  ${f.message}`);
    }
    console.error("");
    console.error("Each is a Google Rich Results required field — Rich Results display is");
    console.error("suppressed when these are absent. Fix the schema component in");
    console.error("src/components/seo/* and re-run.");
    process.exit(1);
  }
  console.log(`[check-jsonld-validity] OK — ${totalBlocks} JSON-LD blocks pass required-field rules across ${targets.length} URLs.`);
}

main().catch((err) => {
  console.error(`[check-jsonld-validity] crash: ${(err as Error).message}`);
  process.exit(2);
});
