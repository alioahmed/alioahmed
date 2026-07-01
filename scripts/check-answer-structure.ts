#!/usr/bin/env tsx
/**
 * Answer-structure checker (GEO/AEO spine).
 *
 * Runs against a built + running Next.js server. Validates the on-page
 * structural patterns that 2025-2026 studies show win across Google AI
 * Overviews, ChatGPT/Perplexity citations, featured snippets, and PAA:
 *
 *   1. Question-format headings (h1-h3 whose text contains "?"). Question
 *      headings ~2x citation likelihood (Indig 2025). An FAQ section satisfies
 *      this.
 *   2. Lists or tables — listicles took the majority of AI citations.
 *   3. An early "answer capsule": a short, link-free lead paragraph (~20-70
 *      words) high in the page; ~44% of citations come from the first 30%.
 *
 * Severity: FAIL = no question heading AND no list/table (invisible to answer
 * engines) · WARN = missing one signal · OK = question headings + list/table.
 *
 * Sample is config-driven (SAMPLE_PAGES). As content pages ship, add them there.
 *
 * Exit 0 = all sampled pages have answer-engine structure · 1 = one or more have none.
 */

import { fetchWithRetry } from "./lib/fetcher";
import { SAMPLE_PAGES } from "./lib/config";

const BASE_URL = process.env.BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

const SAMPLE_URLS = SAMPLE_PAGES;

interface Finding {
  url: string;
  questionHeadings: number;
  hasList: boolean;
  hasTable: boolean;
  hasEarlyCapsule: boolean;
  severity: "ok" | "warn" | "fail";
  notes: string[];
}

async function fetchHtml(path: string): Promise<{ status: number; html: string }> {
  const res = await fetchWithRetry(
    `${BASE_URL}${path}`,
    { headers: { "User-Agent": "alioahmed-answer-structure/1.0" }, redirect: "follow" },
    { maxRetries: 1, timeout: 15000 },
  );
  return { status: res.status, html: await res.text() };
}

/** Strip global chrome so a footer/nav <ul> doesn't make every page report hasList:true. */
function stripChrome(html: string): string {
  return html
    .replace(/<header[\s>][\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s>][\s\S]*?<\/footer>/gi, "")
    .replace(/<nav[\s>][\s\S]*?<\/nav>/gi, "");
}

function countQuestionHeadings(html: string): number {
  const re = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  let n = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]*>/g, "").trim();
    if (text.includes("?")) n++;
  }
  return n;
}

function hasEarlyCapsule(html: string): boolean {
  const bodyStart = html.search(/<body/i);
  const body = bodyStart >= 0 ? html.slice(bodyStart) : html;
  const window = body.slice(0, Math.floor(body.length * 0.4));
  const paras = window.match(/<p[^>]*>[\s\S]*?<\/p>/gi) ?? [];
  for (const p of paras) {
    if (/<a\s/i.test(p)) continue;
    const text = p.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = text.split(" ").filter(Boolean).length;
    if (words >= 20 && words <= 70) return true;
  }
  return false;
}

async function main(): Promise<void> {
  console.log(`[check-answer-structure] BASE_URL=${BASE_URL}`);
  const findings: Finding[] = [];

  for (const url of SAMPLE_URLS) {
    const { status, html } = await fetchHtml(url);
    if (status !== 200) {
      findings.push({
        url, questionHeadings: 0, hasList: false, hasTable: false,
        hasEarlyCapsule: false, severity: "fail", notes: [`HTTP ${status}`],
      });
      continue;
    }
    const questionHeadings = countQuestionHeadings(html);
    const contentHtml = stripChrome(html);
    const hasList = /<(ul|ol)[\s>]/i.test(contentHtml);
    const hasTable = /<table[\s>]/i.test(contentHtml);
    const capsule = hasEarlyCapsule(html);

    const notes: string[] = [];
    if (questionHeadings === 0) notes.push("no question-format headings (add an FAQ / Q&A heading)");
    if (!hasList && !hasTable) notes.push("no list or table (answer engines favour listicles/tables)");
    if (!capsule) notes.push("no early answer capsule (~20-60 word link-free lead paragraph)");

    let severity: Finding["severity"] = "ok";
    if (questionHeadings === 0 && !hasList && !hasTable) severity = "fail";
    else if (notes.length > 0) severity = "warn";

    findings.push({ url, questionHeadings, hasList, hasTable, hasEarlyCapsule: capsule, severity, notes });
  }

  console.log("");
  for (const f of findings) {
    const flag = f.severity === "fail" ? "FAIL" : f.severity === "warn" ? "WARN" : "OK  ";
    console.log(
      `  ${flag} ${f.url}  [Q-headings: ${f.questionHeadings}, list: ${f.hasList ? "y" : "n"}, table: ${f.hasTable ? "y" : "n"}, capsule: ${f.hasEarlyCapsule ? "y" : "n"}]`,
    );
    for (const n of f.notes) console.log(`         - ${n}`);
  }

  const fails = findings.filter((f) => f.severity === "fail");
  const warns = findings.filter((f) => f.severity === "warn");
  console.log("");
  console.log(`[check-answer-structure] ${findings.length} pages — ${fails.length} fail, ${warns.length} warn, ${findings.length - fails.length - warns.length} ok.`);
  if (fails.length > 0) {
    console.error("FAIL — pages with no answer-engine structure (no question heading + no list/table):");
    for (const f of fails) console.error(`  - ${f.url}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`[check-answer-structure] crash: ${(err as Error).message}`);
  process.exit(2);
});
