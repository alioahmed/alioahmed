#!/usr/bin/env tsx
/**
 * AI Overview / answer-engine citation tracker — Bloom & Beyond.
 *
 * Why this exists separately from `llm-check.ts`:
 *   `llm-check.ts` asks each model "tell me about X" and checks whether
 *   `bloomnbeyond.pk` (or the brand name) appears anywhere in the prose.
 *   That measures *conversational* mention. It does NOT measure
 *   *answer-engine* citation — the structured, ranked source list that
 *   Perplexity / ChatGPT Search / Google AI Overview emit alongside the
 *   answer, which is what users actually click.
 *
 *   Conversational mention is fuzzy ("Bloom & Beyond is mentioned in
 *   passing"); citation is binary and ranked ("bloomnbeyond.pk is source
 *   #2 of 4"). We track citation rank per (query, engine) pair over time —
 *   it's the modern equivalent of a featured-snippet placement.
 *
 * Engines (all optional — set whichever keys you have):
 *   - Perplexity Sonar — exposes a `citations` array, the closest 1:1 to
 *     AI-Overview structure. Reached via PERPLEXITY_API_KEY (direct) OR
 *     OPENROUTER_API_KEY (model perplexity/sonar — the key we already use
 *     for llm-check.ts).
 *   - OpenAI gpt-4o-search-preview (OPENAI_API_KEY) — `annotations[]`.
 *   - Google AI Overview via SerpApi (SERPAPI_KEY) — the `ai_overview` block.
 *
 * Output:
 *   - Per-(query × engine) row: rank in citation list or "—" if not cited
 *   - logs/ai-overview/ai-overview-{date}.json (machine record for trends).
 */

import * as fs from "fs";
import * as path from "path";
import { CONFIG } from "./lib/config";
import { fetchWithRetry } from "./lib/fetcher";
import { loadLog } from "./lib/logger";

const PERPLEXITY_KEY = process.env.PERPLEXITY_API_KEY ?? "";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? "";
const OPENAI_KEY = process.env.OPENAI_API_KEY ?? "";
const SERPAPI_KEY = process.env.SERPAPI_KEY ?? "";

// Same intent set as llm-check.ts (so prose-mention and ranked-citation are
// measured on the same queries) — Ali Ahmed's name + niche.
const TARGET_QUERIES = [
  "Who is Ali Ahmed AI Solutions Engineer",
  "Ali Ahmed Cognilium AI",
  "Ali Ahmed Bijli Bachao",
  "AI Solutions Engineer Pakistan LLM RAG",
  "Forward-deployed engineer who ships AI products",
  "Freelance AI agent developer Lahore",
  "Who built Paralegent legal AI",
  "AI RAG consultant available for hire remote",
  "Best AI Solutions Engineer to hire for LLM products",
  "Ali Ahmed alioahmed portfolio",
] as const;

const HOST = CONFIG.host;

interface Citation {
  query: string;
  engine: string;
  cited: boolean;
  rank: number | null;       // 1-indexed; null if not cited
  totalCitations: number;    // how many sources the engine cited overall
  topUrl: string | null;     // engine's #1 cited URL (who we compete against)
  answer: string | null;
  checkedAt: string;
}

function findRank(citations: string[]): { rank: number | null; cited: boolean } {
  for (let i = 0; i < citations.length; i++) {
    if (citations[i].toLowerCase().includes(HOST)) {
      return { rank: i + 1, cited: true };
    }
  }
  return { rank: null, cited: false };
}

/**
 * Perplexity Sonar. Prefers a direct Perplexity key; falls back to
 * OpenRouter (model perplexity/sonar), which forwards the same `citations`
 * array — that's the key we already configure for llm-check.ts.
 */
async function checkPerplexity(query: string): Promise<Citation> {
  const base: Citation = {
    query, engine: "Perplexity Sonar",
    cited: false, rank: null, totalCitations: 0, topUrl: null, answer: null,
    checkedAt: new Date().toISOString(),
  };
  const direct = !!PERPLEXITY_KEY;
  const key = PERPLEXITY_KEY || OPENROUTER_KEY;
  if (!key) return base;
  const endpoint = direct
    ? "https://api.perplexity.ai/chat/completions"
    : "https://openrouter.ai/api/v1/chat/completions";
  const model = direct ? "sonar" : "perplexity/sonar";
  try {
    const res = await fetchWithRetry(
      endpoint,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "Answer the user's question concisely. Cite your sources." },
            { role: "user", content: query },
          ],
        }),
      },
      { maxRetries: 1, timeout: 60000 },
    );
    if (!res.ok) {
      console.warn(
        `    [Perplexity] HTTP ${res.status} for "${query}" — ${(await res.text()).slice(0, 200)}`,
      );
      return base;
    }
    const data = await res.json();
    const citations: string[] =
      data.citations ?? data.search_results?.map((s: { url: string }) => s.url) ?? [];
    const { rank, cited } = findRank(citations);
    return {
      ...base,
      engine: direct ? "Perplexity Sonar" : "Perplexity Sonar (via OpenRouter)",
      cited,
      rank,
      totalCitations: citations.length,
      topUrl: citations[0] ?? null,
      answer: data.choices?.[0]?.message?.content?.slice(0, 500) ?? null,
    };
  } catch (e) {
    console.warn(`    [Perplexity] request failed for "${query}" — ${(e as Error).message}`);
    return base;
  }
}

async function checkOpenAISearch(query: string): Promise<Citation> {
  const base: Citation = {
    query, engine: "OpenAI gpt-4o-search-preview",
    cited: false, rank: null, totalCitations: 0, topUrl: null, answer: null,
    checkedAt: new Date().toISOString(),
  };
  if (!OPENAI_KEY) return base;
  try {
    const res = await fetchWithRetry(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-search-preview",
          messages: [{ role: "user", content: query }],
        }),
      },
      { maxRetries: 1, timeout: 60000 },
    );
    if (!res.ok) {
      console.warn(
        `    [OpenAI] HTTP ${res.status} for "${query}" — ${(await res.text()).slice(0, 200)}`,
      );
      return base;
    }
    const data = await res.json();
    const annotations: Array<{ url_citation?: { url: string } }> =
      data.choices?.[0]?.message?.annotations ?? [];
    const urls = annotations
      .map((a) => a.url_citation?.url)
      .filter((u): u is string => typeof u === "string");
    const { rank, cited } = findRank(urls);
    return {
      ...base,
      cited,
      rank,
      totalCitations: urls.length,
      topUrl: urls[0] ?? null,
      answer: data.choices?.[0]?.message?.content?.slice(0, 500) ?? null,
    };
  } catch (e) {
    console.warn(`    [OpenAI] request failed for "${query}" — ${(e as Error).message}`);
    return base;
  }
}

/**
 * Google AI Overview citation check via SerpApi. SerpApi exposes the
 * `ai_overview` block from Google SERPs as a structured field.
 */
async function checkGoogleAIOverview(query: string): Promise<Citation> {
  const base: Citation = {
    query, engine: "Google AI Overview",
    cited: false, rank: null, totalCitations: 0, topUrl: null, answer: null,
    checkedAt: new Date().toISOString(),
  };
  if (!SERPAPI_KEY) return base;
  try {
    const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`;
    const res = await fetchWithRetry(url, undefined, { maxRetries: 1, timeout: 60000 });
    if (!res.ok) {
      console.warn(
        `    [Google AI Overview] HTTP ${res.status} for "${query}" — ${(await res.text()).slice(0, 200)}`,
      );
      return base;
    }
    const data = await res.json();
    const aio = data.ai_overview ?? {};
    const refs: Array<{ link?: string }> =
      aio.references ?? aio.text_blocks?.flatMap((b: { references?: Array<{ link?: string }> }) => b.references ?? []) ?? [];
    const links = refs.map((r) => r.link).filter((l): l is string => !!l);
    const { rank, cited } = findRank(links);
    return {
      ...base,
      cited,
      rank,
      totalCitations: links.length,
      topUrl: links[0] ?? null,
      answer: typeof aio.text_blocks?.[0]?.snippet === "string" ? aio.text_blocks[0].snippet.slice(0, 500) : null,
    };
  } catch (e) {
    console.warn(`    [Google AI Overview] request failed for "${query}" — ${(e as Error).message}`);
    return base;
  }
}

/**
 * --history mode: compare this/the latest run against the previous one and
 * print the per-engine citation-rank delta per query. Needs no API keys —
 * it only reads the persisted ai-overview-*.json logs.
 */
function showHistory(): void {
  console.log("\n  alioahmed — Answer-Engine Citation History");
  console.log("  ================================================\n");

  const dir = path.join(CONFIG.logsDir, "ai-overview");
  if (!fs.existsSync(dir)) {
    console.warn("  No previous runs found. Run the tracker first.");
    return;
  }

  // Newest-first so [0] = latest, [1] = previous run.
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("ai-overview-") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length < 2) {
    console.warn(`  Only ${files.length} run(s) on record — need at least 2 to show a delta.`);
    return;
  }

  const latestFile = files[0];
  const prevFile = files[1];
  const latest = loadLog(path.join(dir, latestFile));
  const prev = loadLog(path.join(dir, prevFile));
  if (!latest || !prev) {
    console.warn("  Could not parse the two most recent run logs.");
    return;
  }

  // Build (engine|query) -> rank lookups. rank null = not cited.
  const rankMap = (data: Record<string, unknown>): Map<string, number | null> => {
    const map = new Map<string, number | null>();
    const results = (data.results as Citation[]) ?? [];
    for (const r of results) map.set(`${r.engine} ${r.query}`, r.cited ? r.rank : null);
    return map;
  };
  const latestMap = rankMap(latest);
  const prevMap = rankMap(prev);

  console.log(`  Comparing latest (${latestFile}) vs previous (${prevFile}).\n`);

  const fmt = (rank: number | null): string => (rank == null ? "—" : `#${rank}`);

  // One section per engine; only show rows that changed.
  const engines = [...new Set([...latestMap.keys()].map((k) => k.split(" ")[0]))].sort();
  for (const engine of engines) {
    console.log(`  ── ${engine} ──`);
    let changes = 0;
    for (const query of TARGET_QUERIES) {
      const k = `${engine} ${query}`;
      const now = latestMap.has(k) ? latestMap.get(k)! : null;
      const before = prevMap.has(k) ? prevMap.get(k)! : null;
      if (now === before) continue;
      changes++;
      // Lower rank number is better; cited-now-but-not-before is an improvement.
      let arrow = "→";
      if (before == null && now != null) arrow = "▲ new citation";
      else if (before != null && now == null) arrow = "▼ lost citation";
      else if (before != null && now != null) arrow = now < before ? "▲ improved" : "▼ slipped";
      console.log(`    "${query}": ${fmt(before)} → ${fmt(now)}  ${arrow}`);
    }
    if (changes === 0) console.log("    (no rank changes vs previous run)");
    console.log("");
  }
}

async function main(): Promise<void> {
  if (process.argv.slice(2).includes("--history")) {
    showHistory();
    return;
  }

  const havePerplexity = PERPLEXITY_KEY || OPENROUTER_KEY;
  const haveAny = havePerplexity || OPENAI_KEY || SERPAPI_KEY;
  if (!haveAny) {
    console.log(`
  No API keys set. Configure at least one (these are OUR keys — same as
  the ones llm-check.ts / the other scripts use):

    OPENROUTER_API_KEY=sk-or-...   — Perplexity Sonar via OpenRouter (we have this)
    PERPLEXITY_API_KEY=pplx-...    — direct Perplexity (optional override)
    OPENAI_API_KEY=sk-...          — OpenAI gpt-4o-search-preview
    SERPAPI_KEY=...                — Google AI Overview (via SerpApi)
`);
    process.exit(1);
  }

  console.log("\n  alioahmed — Answer-Engine Citation Tracker");
  console.log("  ================================================\n");
  console.log(`  Engines enabled: ${[
    havePerplexity && (PERPLEXITY_KEY ? "Perplexity (direct)" : "Perplexity (OpenRouter)"),
    OPENAI_KEY && "OpenAI",
    SERPAPI_KEY && "Google AI Overview",
  ].filter(Boolean).join(", ")}\n`);

  const all: Citation[] = [];
  for (const query of TARGET_QUERIES) {
    console.log(`  Query: "${query}"`);
    const rows: Citation[] = [];
    if (havePerplexity) rows.push(await checkPerplexity(query));
    if (OPENAI_KEY) rows.push(await checkOpenAISearch(query));
    if (SERPAPI_KEY) rows.push(await checkGoogleAIOverview(query));
    for (const r of rows) {
      const flag = r.cited ? `CITED #${r.rank}/${r.totalCitations}` : "not cited";
      console.log(`    ${r.engine.padEnd(38)} ${flag}`);
      all.push(r);
    }
    console.log("");
  }

  // Persist. Key the filename on a full timestamp (matching the Logger's
  // scheme) so a second run on the same day doesn't overwrite the first —
  // trend tracking needs every run preserved.
  const dir = path.join(CONFIG.logsDir, "ai-overview");
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const file = path.join(dir, `ai-overview-${stamp}.json`);
  fs.writeFileSync(file, JSON.stringify({ runAt: new Date().toISOString(), results: all }, null, 2));

  const cited = all.filter((r) => r.cited);
  const byEngine = new Map<string, number>();
  for (const r of cited) byEngine.set(r.engine, (byEngine.get(r.engine) ?? 0) + 1);

  console.log("Summary");
  console.log("  Total checks:", all.length);
  console.log("  Cited:       ", cited.length);
  for (const [engine, count] of byEngine.entries()) {
    console.log(`  ${engine}: ${count}/${TARGET_QUERIES.length} queries cite ${HOST}`);
  }
  console.log(`\n  Saved: ${path.relative(process.cwd(), file)}\n`);
}

main().catch((err) => {
  console.error(`[ai-overview-track] crash: ${(err as Error).message}`);
  process.exit(2);
});
