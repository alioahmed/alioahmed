#!/usr/bin/env tsx
/**
 * check-canonical-trace.ts — advisory metric provenance check.
 *
 * Every numeric metric shown on the site should trace to the reviewed canonical
 * corpus (../canonical/*.md + ../BIO-SHEET-ALI.md, one dir up, outside this repo).
 * This lists any content metric with no canonical source as a WARNING — it never
 * fails the build (exit 0), because some figures are legitimately cross-file or
 * derived, and the canonical corpus is absent in CI.
 *
 * When the corpus is absent (e.g. in CI), print a `::notice::` and exit 0.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve, relative } from "node:path";

const ROOT = process.cwd();
const CANONICAL_DIR = resolve(ROOT, "..", "canonical");
const BIO_SHEET = resolve(ROOT, "..", "BIO-SHEET-ALI.md");

const CONTENT_FILES = ["stats", "experience", "projects", "credentials"].map((n) =>
  join(ROOT, "src/lib/content", `${n}.ts`),
);

/** Normalize a metric/corpus string: lowercase, drop commas/~/+/USD/PKR/%/whitespace. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/usd|pkr/g, "")
    .replace(/[,~+%\s]/g, "");
}

/** Collect the canonical corpus text, or null if the corpus is absent. */
function loadCorpus(): string | null {
  const parts: string[] = [];
  if (existsSync(CANONICAL_DIR) && statSync(CANONICAL_DIR).isDirectory()) {
    for (const entry of readdirSync(CANONICAL_DIR)) {
      if (entry.endsWith(".md")) {
        parts.push(readFileSync(join(CANONICAL_DIR, entry), "utf8"));
      }
    }
  }
  if (existsSync(BIO_SHEET) && statSync(BIO_SHEET).isFile()) {
    parts.push(readFileSync(BIO_SHEET, "utf8"));
  }
  return parts.length > 0 ? parts.join("\n") : null;
}

/** Extract distinct metric tokens (the `value: '...'` fields) from the content files. */
function extractMetrics(): { token: string; file: string; line: number }[] {
  const out: { token: string; file: string; line: number }[] = [];
  const seen = new Set<string>();
  const VALUE_RE = /value:\s*'([^']+)'/g;
  for (const file of CONTENT_FILES) {
    if (!existsSync(file)) continue;
    const rel = relative(ROOT, file);
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      let m: RegExpExecArray | null;
      VALUE_RE.lastIndex = 0;
      while ((m = VALUE_RE.exec(line)) !== null) {
        const raw = m[1];
        // Only care about tokens that carry at least one digit (real metrics).
        if (!/\d/.test(raw)) continue;
        const key = norm(raw);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push({ token: raw, file: rel, line: i + 1 });
      }
    });
  }
  return out;
}

function main(): void {
  const corpus = loadCorpus();

  if (corpus === null) {
    console.log(
      "::notice:: [check-canonical-trace] Canonical corpus not found " +
        `(${relative(ROOT, CANONICAL_DIR)} / ${relative(ROOT, BIO_SHEET)}). ` +
        "Skipping — advisory check is a no-op outside the local authoring environment.",
    );
    return;
  }

  const normCorpus = norm(corpus);
  const metrics = extractMetrics();
  const unsourced = metrics.filter((m) => !normCorpus.includes(norm(m.token)));

  console.log(
    `[check-canonical-trace] ${metrics.length} distinct metric token(s) checked against the canonical corpus.`,
  );

  if (unsourced.length === 0) {
    console.log("[check-canonical-trace] OK — every metric traces to a canonical source.");
    return;
  }

  console.log(
    `\n[check-canonical-trace] ${unsourced.length} metric(s) with no direct canonical match (advisory — may be cross-file/derived):`,
  );
  for (const u of unsourced) {
    console.log(`  - "${u.token}"  (${u.file}:${u.line})`);
  }
  console.log(
    "\n[check-canonical-trace] Advisory only — exit 0. Verify each is legitimately sourced.",
  );
}

main();
