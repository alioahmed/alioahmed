/**
 * LLM Citation Check — alioahmed
 *
 * Tests whether AI models mention Ali Ahmed / alioahmed in their responses.
 * Uses OpenRouter so one API key gives access to Perplexity + OpenAI + Anthropic
 * (and many others) with a single bill.
 *
 * USAGE:
 *   npx tsx scripts/llm-check.ts             — Run all prompts against configured models
 *   npx tsx scripts/llm-check.ts --history    — Show citation trends across runs
 *   npx tsx scripts/llm-check.ts --help       — Show help
 *
 * ENV VAR (required):
 *   OPENROUTER_API_KEY    — Get one at https://openrouter.ai/keys
 */

import * as fs from "fs";
import * as path from "path";
import { CONFIG } from "./lib/config";
import { Logger, loadLog } from "./lib/logger";
import { fetchWithRetry } from "./lib/fetcher";
import type { LLMCitationResult } from "./lib/types";

const HELP = `
  alioahmed — LLM Citation Check

  Commands:
    (no args)       Run all test prompts against configured OpenRouter models
    --history       Show citation trends from previous runs

  Environment Variable:
    OPENROUTER_API_KEY    OpenRouter key (https://openrouter.ai/keys)

  Examples:
    npx tsx scripts/llm-check.ts
    OPENROUTER_API_KEY=sk-or-xxx npx tsx scripts/llm-check.ts
`;

const TEST_PROMPTS = [
  "Who is Ali Ahmed the AI Solutions Engineer",
  "Ali Ahmed Cognilium AI",
  "Ali Ahmed Bijli Bachao Head of Product",
  "AI Solutions Engineer in Pakistan who ships LLM and RAG products",
  "Who built Paralegent agentic legal AI",
  "Freelance forward-deployed AI engineer to hire",
  "AI agent and RAG consultant available remote",
  "Best AI Solutions Engineer for an LLM product",
  "alioahmed portfolio AI products",
  "Ali Ahmed VORTA enterprise RAG assistant",
];

// Brand-mention patterns for this PERSON: the domain, the name (+ common
// misspelling guard), the handle, and the entity anchors that disambiguate him.
const CITATION_PATTERNS = [
  CONFIG.host,
  "ali ahmed",
  "alioahmed",
  "cognilium",
  "bijli bachao",
];

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const SYSTEM_PROMPT =
  "You are a helpful assistant. Provide detailed recommendations with specific brand names and website URLs when possible.";

// Models to test — all run through OpenRouter with one key.
// Slugs follow OpenRouter's naming: <provider>/<model>.
// See https://openrouter.ai/models for the full list and per-model pricing.
interface ModelConfig {
  label: string; // friendly name shown in output
  slug: string; // OpenRouter model slug
}

const MODELS: ModelConfig[] = [
  { label: "Perplexity Sonar", slug: "perplexity/sonar" },
  { label: "GPT-4o Mini", slug: "openai/gpt-4o-mini" },
  { label: "Claude 3.5 Haiku", slug: "anthropic/claude-3.5-haiku" },
];

function detectCitation(response: string): { cited: boolean; context: string | null } {
  const lower = response.toLowerCase();

  for (const pattern of CITATION_PATTERNS) {
    const idx = lower.indexOf(pattern.toLowerCase());
    if (idx !== -1) {
      const start = Math.max(0, idx - 40);
      const end = Math.min(response.length, idx + pattern.length + 80);
      const context = response.substring(start, end).replace(/\n/g, " ").trim();
      return { cited: true, context: `...${context}...` };
    }
  }

  return { cited: false, context: null };
}

async function queryModel(
  model: ModelConfig,
  prompt: string,
  apiKey: string,
  logger: Logger
): Promise<LLMCitationResult> {
  try {
    const res = await fetchWithRetry(
      OPENROUTER_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": CONFIG.siteUrl,
          "X-Title": "alioahmed LLM Citation Check",
        },
        body: JSON.stringify({
          model: model.slug,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          max_tokens: 1000,
        }),
      },
      { timeout: 60000, maxRetries: 1 }
    );

    if (!res.ok) {
      const errorText = await res.text();
      logger.warn(
        `${model.label} error for "${prompt.substring(0, 40)}..." — ${res.status} ${errorText.substring(0, 120)}`
      );
      return {
        provider: model.label,
        prompt,
        cited: false,
        citationContext: `API error: ${res.status}`,
        fullResponse: null,
        checkedAt: new Date().toISOString(),
      };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const response = data.choices?.[0]?.message?.content || "";
    const { cited, context } = detectCitation(response);

    return {
      provider: model.label,
      prompt,
      cited,
      citationContext: context,
      fullResponse: response,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    logger.warn(
      `${model.label} failed for "${prompt.substring(0, 40)}..." — ${(err as Error).message}`
    );
    return {
      provider: model.label,
      prompt,
      cited: false,
      citationContext: `Error: ${(err as Error).message}`,
      fullResponse: null,
      checkedAt: new Date().toISOString(),
    };
  }
}

async function runChecks(logger: Logger): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  if (!apiKey) {
    console.error("  OPENROUTER_API_KEY not set.\n");
    console.error("  Get a key at https://openrouter.ai/keys — $5 deposit covers many runs.");
    console.error("  Then: OPENROUTER_API_KEY=sk-or-xxx npx tsx scripts/llm-check.ts");
    // Exit non-zero so a scheduled run can distinguish "ran, found nothing"
    // from "never ran" (missing credential).
    process.exit(1);
  }

  logger.info(
    `Running ${TEST_PROMPTS.length} prompts x ${MODELS.length} model(s) via OpenRouter...\n`
  );

  const allResults: LLMCitationResult[] = [];

  for (const model of MODELS) {
    console.log(`\n  ── ${model.label} (${model.slug}) ──\n`);

    let cited = 0;
    let total = 0;

    for (const prompt of TEST_PROMPTS) {
      total++;
      const result = await queryModel(model, prompt, apiKey, logger);
      allResults.push(result);

      if (result.cited) {
        cited++;
        logger.success(`[CITED] "${prompt}"`);
        console.log(`           ${result.citationContext}`);
      } else {
        logger.info(`[-----] "${prompt}"`);
      }

      // Small delay between requests to avoid rate limiting
      await new Promise((r) => setTimeout(r, 1000));
    }

    console.log(`\n  ${model.label} score: ${cited}/${total} prompts cited Ali Ahmed`);
  }

  // Overall summary
  console.log("\n  ────────────────────────────────────");
  console.log("  CITATION SUMMARY");
  console.log("  ────────────────────────────────────\n");

  for (const model of MODELS) {
    const modelResults = allResults.filter((r) => r.provider === model.label);
    const citedCount = modelResults.filter((r) => r.cited).length;
    const pct =
      modelResults.length > 0
        ? ((citedCount / modelResults.length) * 100).toFixed(0)
        : "0";
    console.log(
      `  ${model.label.padEnd(20)} ${citedCount}/${modelResults.length} cited (${pct}%)`
    );
  }

  const totalCited = allResults.filter((r) => r.cited).length;
  const totalPct =
    allResults.length > 0
      ? ((totalCited / allResults.length) * 100).toFixed(0)
      : "0";
  console.log(
    `\n  Overall:              ${totalCited}/${allResults.length} cited (${totalPct}%)`
  );

  // Per-prompt breakdown
  console.log("\n  Per-prompt breakdown:");
  for (const prompt of TEST_PROMPTS) {
    const promptResults = allResults.filter((r) => r.prompt === prompt);
    const promptCited = promptResults.filter((r) => r.cited);
    const models = promptCited.map((r) => r.provider).join(", ") || "none";
    const label = promptCited.length > 0 ? "CITED" : "-----";
    console.log(`    [${label}] "${prompt}" — ${models}`);
  }

  logger.save({
    transport: "openrouter",
    models: MODELS.map((m) => ({ label: m.label, slug: m.slug })),
    totalPrompts: TEST_PROMPTS.length,
    totalChecks: allResults.length,
    totalCited,
    citationRate: `${totalPct}%`,
    results: allResults,
  });
}

function showHistory(logger: Logger): void {
  console.log("\n  Citation History\n");

  const dir = path.join(CONFIG.logsDir, "llm");

  if (!fs.existsSync(dir)) {
    logger.warn("No previous runs found. Run the check first.");
    return;
  }

  const files = fs
    .readdirSync(dir)
    .filter((f: string) => f.startsWith("llm-check") && f.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    logger.warn("No previous runs found.");
    return;
  }

  console.log(
    `  ${"Date".padEnd(22)} ${"Models".padEnd(40)} ${"Cited".padEnd(10)} ${"Rate"}`
  );
  console.log(`  ${"-".repeat(82)}`);

  for (const file of files) {
    const data = loadLog(path.join(dir, file));
    if (!data || !data.summary) continue;

    const summary = data.summary as Record<string, unknown>;
    const date = ((data.startedAt as string) || "").substring(0, 19).replace("T", " ");
    const modelList =
      ((summary.models as { label: string }[]) || []).map((m) => m.label).join(", ") ||
      ((summary.providers as string[]) || []).join(", ") ||
      "unknown";
    const totalCited = (summary.totalCited as number) || 0;
    const totalChecks = (summary.totalChecks as number) || 0;
    const rate = (summary.citationRate as string) || "0%";

    console.log(
      `  ${date.padEnd(22)} ${modelList.substring(0, 38).padEnd(40)} ${`${totalCited}/${totalChecks}`.padEnd(10)} ${rate}`
    );
  }

  const rateOf = (file: string): number | null => {
    const data = loadLog(path.join(dir, file));
    if (!data?.summary) return null;
    return parseInt(
      ((data.summary as Record<string, unknown>).citationRate as string) || "0"
    );
  };
  const trendLabel = (diff: number): string =>
    diff > 0 ? `+${diff}pp improvement` : diff < 0 ? `${diff}pp decline` : "no change";

  if (files.length >= 2) {
    // Headline = the LAST TWO runs. Comparing oldest-vs-newest would let a
    // months-old improvement mask a fresh regression, so the at-a-glance
    // trend must track the most recent delta.
    const prevFile = files[files.length - 2];
    const lastFile = files[files.length - 1];
    const prevRate = rateOf(prevFile);
    const lastRate = rateOf(lastFile);

    if (prevRate !== null && lastRate !== null) {
      console.log(
        `\n  Trend (last run): ${trendLabel(lastRate - prevRate)} (${prevFile.substring(10, 29)} to ${lastFile.substring(10, 29)})`
      );
    }

    // Keep the original oldest-vs-newest comparison as a separate
    // "since inception" line for long-term context.
    const firstRate = rateOf(files[0]);
    if (firstRate !== null && lastRate !== null) {
      console.log(
        `  Since inception:  ${trendLabel(lastRate - firstRate)} (${files[0].substring(10, 29)} to ${lastFile.substring(10, 29)})`
      );
    }
  }

  console.log(`\n  Total runs: ${files.length}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(HELP);
    return;
  }

  const logger = new Logger("llm", "llm-check");

  console.log("\n  alioahmed — LLM Citation Check");
  console.log("  ===================================\n");

  if (args.includes("--history")) {
    showHistory(logger);
    return;
  }

  await runChecks(logger);
}

main().catch((err) => {
  console.error(`\n  Fatal error: ${err.message}`);
  process.exit(1);
});
