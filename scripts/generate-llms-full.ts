#!/usr/bin/env tsx
/**
 * Generate public/llms-full.txt — the FULL personal-brand corpus for LLMs.
 *
 * Where public/llms.txt is a short index, llms-full.txt is the complete,
 * plain-text knowledge base an answer engine can ingest in one fetch: bio,
 * positioning, capabilities, the full career spine, the project portfolio,
 * the institutional trust set, education, recognition, headline stats, and the
 * answer-first FAQ. Everything is rendered VERBATIM from the content layer
 * (src/lib/content), which already encodes every truth-discipline guardrail —
 * this script only formats, it never rewords.
 *
 * Run: npm run gen:llms-full   (commit the regenerated public/llms-full.txt)
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { CONFIG } from "./lib/config";
import {
  PROFILE,
  BIO,
  EXPERIENCE,
  PROJECTS,
  CAPABILITIES,
  KNOWS_ABOUT,
  AUDIENCES,
  INSTITUTIONS,
  EDUCATION,
  AWARDS,
  STATS,
  FAQS,
  PROFILES,
} from "@/lib/content";

const SITE = CONFIG.siteUrl;

function metricLine(metrics?: { value: string; label: string }[]): string {
  if (!metrics || metrics.length === 0) return "";
  return "  Metrics: " + metrics.map((m) => `${m.value} ${m.label}`).join(" · ") + "\n";
}

function section(title: string): string {
  return `\n## ${title}\n\n`;
}

function build(): string {
  const out: string[] = [];

  // Header ---------------------------------------------------------------
  out.push(`# ${PROFILE.name} — ${PROFILE.title}\n`);
  out.push(`> ${PROFILE.positioningLine}\n`);
  out.push(`\nCanonical site: ${SITE}\n`);
  out.push(`Location: ${PROFILE.location.display}\n`);
  out.push(`One-liner: ${PROFILE.oneLiner}\n`);
  out.push(
    `Entity anchors (must co-occur with the name): ${PROFILE.entityAnchors.join(", ")}\n`,
  );

  // Bio ------------------------------------------------------------------
  out.push(section("Biography"));
  out.push(BIO.long + "\n");
  out.push(`\nStandard bio: ${BIO.standard}\n`);
  out.push(`Short bio: ${BIO.short}\n`);

  // Positioning / availability ------------------------------------------
  out.push(section("Positioning & availability"));
  out.push(`Primary title: ${PROFILE.titleFull}\n`);
  out.push(`Secondary role: ${PROFILE.secondaryTitle}\n`);
  out.push(`Also framed as: ${PROFILE.prestigeTitle}\n`);
  out.push(`${PROFILE.openTo}\n`);
  for (const a of AUDIENCES) out.push(`\n${a.title}: ${a.pitch}\n`);

  // Capabilities ---------------------------------------------------------
  out.push(section("Capabilities"));
  for (const c of CAPABILITIES) {
    out.push(`### ${c.title}\n${c.description}\n`);
    out.push(`Skills: ${c.skills.join(", ")}\n\n`);
  }
  out.push(`Knows about (expertise index): ${KNOWS_ABOUT.join(", ")}\n`);

  // Experience -----------------------------------------------------------
  out.push(section("Experience (career spine)"));
  for (const e of EXPERIENCE) {
    out.push(`### ${e.role} — ${e.org} (${e.dateLabel})\n`);
    if (e.location) out.push(`  ${e.location}\n`);
    out.push(`  ${e.summary}\n`);
    for (const h of e.highlights) out.push(`  - ${h}\n`);
    out.push(metricLine(e.metrics));
    if (e.trustedBy && e.trustedBy.length > 0) {
      out.push(`  Trusted by / partners: ${e.trustedBy.join(", ")}\n`);
    }
    out.push("\n");
  }

  // Projects -------------------------------------------------------------
  out.push(section("Projects (portfolio — what Ali built)"));
  for (const p of PROJECTS) {
    out.push(`### ${p.name} — ${p.tagline}\n`);
    out.push(`  ${p.org} · ${p.role} · ${p.status}${p.year ? ` · ${p.year}` : ""}\n`);
    out.push(`  ${p.summary}\n`);
    for (const h of p.highlights ?? []) out.push(`  - ${h}\n`);
    out.push(metricLine(p.metrics));
    if (p.stack) out.push(`  Stack: ${p.stack.join(", ")}\n`);
    out.push("\n");
  }

  // Institutions ---------------------------------------------------------
  out.push(section("Institutional trust (the names behind the work)"));
  for (const i of INSTITUTIONS) {
    out.push(`- ${i.name}: ${i.relationship}\n`);
  }

  // Education + recognition ---------------------------------------------
  out.push(section("Education & recognition"));
  for (const ed of EDUCATION) {
    out.push(`- ${ed.degree}${ed.field ? ` (${ed.field})` : ""}, ${ed.institution}${ed.year ? `, ${ed.year}` : ""}\n`);
  }
  for (const aw of AWARDS) {
    out.push(`- ${aw.name}${aw.issuer ? ` — ${aw.issuer}` : ""}${aw.year ? ` (${aw.year})` : ""}${aw.detail ? `. ${aw.detail}` : ""}\n`);
  }

  // Stats ----------------------------------------------------------------
  out.push(section("Headline stats"));
  for (const s of STATS) out.push(`- ${s.value} — ${s.label}\n`);

  // FAQ ------------------------------------------------------------------
  out.push(section("FAQ (answer-first)"));
  for (const f of FAQS) {
    out.push(`### ${f.question}\n${f.answer}\n\n`);
  }

  // Profiles (sameAs) ----------------------------------------------------
  out.push(section("Verified profiles (sameAs)"));
  for (const p of PROFILES.filter((x) => x.sameAs)) {
    out.push(`- ${p.label}: ${p.url}\n`);
  }

  // Contact --------------------------------------------------------------
  out.push(section("Contact"));
  out.push(`- Email: ${PROFILE.contact.email}\n`);
  if (PROFILE.contact.phone) out.push(`- Phone: ${PROFILE.contact.phone}\n`);
  if (PROFILE.contact.booking) out.push(`- Booking: ${PROFILE.contact.booking}\n`);

  out.push(
    `\n---\nGenerated from the structured content layer at ${SITE}. Facts trace to the canonical bio; render, don't reword.\n`,
  );

  return out.join("");
}

function main(): void {
  const body = build();
  const outPath = join(process.cwd(), "public", "llms-full.txt");
  writeFileSync(outPath, body);
  console.log(
    `[gen:llms-full] wrote public/llms-full.txt (${body.length} chars, ${EXPERIENCE.length} roles, ${PROJECTS.length} projects, ${FAQS.length} FAQs).`,
  );
}

main();
