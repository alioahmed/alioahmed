#!/usr/bin/env tsx
/**
 * check-guardrails.ts — the truth-discipline CI gate.
 *
 * Scans the rendered/content text sources (src/lib/content/**\/*.ts, public/llms.txt,
 * public/llms-full.txt) for claims that violate Ali's locked positioning + the
 * RETRACTED-stat rules (canonical/P1 §7 "never publish"). Any hit fails the build.
 *
 * Two guards:
 *   1. DENYLIST — case-insensitive patterns that must NEVER appear in real content.
 *   2. POSITIVE assertions — strings that MUST be present (title, locked roles/status).
 *
 * Doc-comment discipline: lines that DOCUMENT a guardrail (they contain "guardrail",
 * "never", "GUARDRAILS", or are comment lines starting with `*` / `//`) are IGNORED —
 * the goal is to catch real rendered strings, not the comments that describe what NOT
 * to say. See the self-test note in the repo instructions.
 *
 * Exit: 0 = clean; 1 = one or more violations (each printed with file + matched text).
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/** True if a line merely DOCUMENTS a guardrail and should not be scanned. */
function isDocLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.startsWith("*") || trimmed.startsWith("//") || trimmed.startsWith("/*")) {
    return true;
  }
  const lower = line.toLowerCase();
  return lower.includes("guardrail") || lower.includes("never");
}

/** Recursively collect *.ts files under a directory. */
function collectTs(dir: string, out: string[]): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) collectTs(full, out);
    else if (entry.isFile() && entry.name.endsWith(".ts")) out.push(full);
  }
}

function textSources(): string[] {
  const files: string[] = [];
  collectTs(join(ROOT, "src/lib/content"), files);
  for (const rel of ["public/llms.txt", "public/llms-full.txt"]) {
    const full = join(ROOT, rel);
    if (existsSync(full) && statSync(full).isFile()) files.push(full);
  }
  return files;
}

interface Deny {
  re: RegExp;
  note: string;
}

/** Case-insensitive denylist. Each pattern is matched per (non-doc) line. */
const DENYLIST: Deny[] = [
  { re: /founder of cognilium/i, note: "role belongs to Mudassir, not Ali" },
  { re: /ceo of cognilium/i, note: "role belongs to Mudassir, not Ali" },
  { re: /\bsolo\b/i, note: "no solo framing" },
  { re: /\bsole founder\b/i, note: "no sole-founder framing" },
  { re: /single-?handed/i, note: "no single-handed framing" },
  { re: /ex-gates/i, note: "never 'ex-Gates'" },
  { re: /ex-unido/i, note: "never 'ex-UNIDO'" },
  { re: /vibe cod/i, note: "no 'vibe coding'" },
  { re: /\bAhmad\b/i, note: "name is 'Ahmed', not 'Ahmad'" },
  { re: /presented on stage/i, note: "never claim stage presentation" },
  { re: /spoke on stage/i, note: "never claim stage speaking" },
  // Paralegent RETRACTED stats (canonical/P1 §7 "never publish").
  { re: /312% ROI/i, note: "retracted Paralegent stat" },
  { re: /90%\+ accuracy/i, note: "retracted Paralegent stat" },
  { re: /\$99\/month/i, note: "retracted Paralegent stat" },
  { re: /14-day (free )?trial/i, note: "retracted Paralegent stat" },
  { re: /SOC 2/i, note: "retracted Paralegent stat" },
  { re: /ISO 27001/i, note: "retracted Paralegent stat" },
  { re: /99\.9% uptime/i, note: "retracted Paralegent stat" },
  { re: /11 agents/i, note: "retracted Paralegent stat" },
];

/* Precise Bijli-Bachao megawatts: forbid `<n> MW` UNLESS it is the approved
   `~3 MW` (preceded by `~`). `MWh` energy units are naturally excluded by the
   `\b` after `MW` (the following `h` is a word char, so no boundary matches). */
const MW_RE = /\b\d+(\.\d+)?\s?MW\b/gi;

interface Violation {
  file: string;
  line: number;
  matched: string;
  note: string;
}

function scanDenylist(): Violation[] {
  const violations: Violation[] = [];
  for (const file of textSources()) {
    const rel = relative(ROOT, file);
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (isDocLine(line)) return;

      for (const { re, note } of DENYLIST) {
        const m = line.match(re);
        if (m) {
          violations.push({ file: rel, line: i + 1, matched: m[0], note });
        }
      }

      // Megawatt check with the ~3 MW allowance.
      MW_RE.lastIndex = 0;
      let mw: RegExpExecArray | null;
      while ((mw = MW_RE.exec(line)) !== null) {
        const before = line[mw.index - 1];
        if (before === "~") continue; // approved "~3 MW"
        violations.push({
          file: rel,
          line: i + 1,
          matched: mw[0],
          note: "precise Bijli-Bachao megawatts — only '~3 MW' is allowed",
        });
      }
    });
  }
  return violations;
}

/** Extract the object literal text for a project by slug (best-effort, robust to formatting). */
function projectBlock(src: string, slug: string): string | null {
  const idx = src.indexOf(`slug: '${slug}'`);
  if (idx === -1) return null;
  const next = src.indexOf("slug: '", idx + 1);
  return src.slice(idx, next === -1 ? undefined : next);
}

interface PositiveMiss {
  what: string;
  detail: string;
}

function checkPositives(): PositiveMiss[] {
  const misses: PositiveMiss[] = [];

  const profilePath = join(ROOT, "src/lib/content/profile.ts");
  if (!existsSync(profilePath)) {
    misses.push({ what: "profile.ts", detail: "file missing" });
  } else {
    const profile = readFileSync(profilePath, "utf8");
    if (!profile.includes("AI Solutions Engineer")) {
      misses.push({
        what: 'profile.ts must contain "AI Solutions Engineer"',
        detail: "locked title not found",
      });
    }
  }

  const projectsPath = join(ROOT, "src/lib/content/projects.ts");
  if (!existsSync(projectsPath)) {
    misses.push({ what: "projects.ts", detail: "file missing" });
  } else {
    const projects = readFileSync(projectsPath, "utf8");

    const paralegent = projectBlock(projects, "paralegent");
    if (!paralegent) {
      misses.push({ what: "Paralegent project", detail: "slug 'paralegent' not found" });
    } else if (!/role:\s*'AI Product Manager'/.test(paralegent)) {
      misses.push({
        what: "Paralegent role",
        detail: "must be 'AI Product Manager' (Mudassir is Founder/CEO)",
      });
    }

    const bbs = projectBlock(projects, "build-buy-software");
    if (!bbs) {
      misses.push({
        what: "Build Buy Software project",
        detail: "slug 'build-buy-software' not found",
      });
    } else if (!/status:\s*'pre-launch'/.test(bbs)) {
      misses.push({
        what: "Build Buy Software status",
        detail: "must be 'pre-launch'",
      });
    }
  }

  return misses;
}

function main(): void {
  const denyHits = scanDenylist();
  const positiveMisses = checkPositives();

  console.log("[check-guardrails] scanning content + llms text sources…");

  if (denyHits.length === 0 && positiveMisses.length === 0) {
    console.log("[check-guardrails] OK — no denylist hits; all positive assertions hold.");
    return;
  }

  if (denyHits.length > 0) {
    console.error(`\n[check-guardrails] DENYLIST — ${denyHits.length} forbidden string(s):`);
    for (const v of denyHits) {
      console.error(`  - ${v.file}:${v.line}  "${v.matched}"  (${v.note})`);
    }
  }

  if (positiveMisses.length > 0) {
    console.error(`\n[check-guardrails] POSITIVE — ${positiveMisses.length} required assertion(s) failed:`);
    for (const m of positiveMisses) {
      console.error(`  - ${m.what}: ${m.detail}`);
    }
  }

  console.error("\n[check-guardrails] FAIL — truth-discipline violated. Fix the content and re-run.");
  process.exit(1);
}

main();
