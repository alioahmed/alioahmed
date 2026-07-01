#!/usr/bin/env node
//
// Pre-push / pre-deploy metadata linter (pure Node — no build, no network).
//
// Walks every page.tsx / layout.tsx under src/app and checks the Next.js
// Metadata export for the cheap, common mistakes that silently tank CTR:
//   - missing title / description on a page.tsx
//   - title > 70 chars (SERP truncation) / description > 160 chars
//   - no canonical (alternates.canonical) — duplicate-content risk
//   - no openGraph — broken social/AI cards
//
// Report-only (always exits 0). This site centralises title + openGraph in the
// root layout (`title: { default, template }`), so a page.tsx legitimately
// "has no title of its own" — it inherits one. A hard-fail model would
// false-positive on every such page, so this surfaces issues as warnings for
// review instead of blocking the build. Length issues (the real CTR bug) are
// surfaced too — fixing them is a deliberate SEO edit, not an automated one.
//
// Skipped: dynamic routes (generateMetadata), helper-built metadata, client
// components inheriting from a layout, and `robots: noindex` pages (admin).

const fs = require('fs');
const path = require('path');

const MAX_TITLE_LENGTH = 70;
const MAX_DESCRIPTION_LENGTH = 160;

// Route segments that are intentionally not in search (private/auth-gated).
const SKIP_DIRS = new Set(['admin']);

let warnings = [];
let successes = 0;
let skipped = 0;

function findPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(file)) return;
      findPageFiles(filePath, fileList);
    } else if (file === 'page.tsx' || file === 'layout.tsx') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function validateMetadata(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative(path.join(__dirname, '..'), filePath);

  // noindex pages are intentionally out of search — don't lint their meta.
  // Matches both the string form (robots: "noindex...") and the Next.js object
  // form (robots: { index: false }), which the string-only test missed.
  if (/robots:\s*['"`]?[^,}]*noindex/i.test(content) || /index:\s*false/i.test(content)) {
    skipped++;
    return;
  }

  // Dynamic routes use generateMetadata — valid, skip
  if (content.includes('export async function generateMetadata') ||
      content.includes('export function generateMetadata')) {
    successes++;
    return;
  }

  // Metadata built by a helper (e.g. buildMetadata(content)) — the
  // title/description live in the data module, not this file. Valid, skip.
  if (/export const metadata[^=]*=\s*[A-Za-z_$][\w$]*\(/.test(content)) {
    successes++;
    return;
  }

  // Client components without metadata — warning only
  if (content.includes('"use client"') || content.includes("'use client'")) {
    if (!content.includes('export const metadata')) {
      // Client components typically get metadata from their layout
      return;
    }
  }

  // Check for standard Next.js metadata export
  if (content.includes('export const metadata')) {
    // Anchor title/description checks to the TOP-LEVEL metadata only. A naive
    // first-occurrence match anywhere can land on a title/description nested in
    // an openGraph: {...} or twitter: {...} block (those legitimately repeat
    // the fields), mis-attributing their length to the page. Restrict the
    // search window to everything before the first nested social block.
    const ogKeyIdx = content.search(/\bopenGraph\s*:/);
    const twKeyIdx = content.search(/\btwitter\s*:/);
    const cutCandidates = [ogKeyIdx, twKeyIdx].filter((i) => i >= 0);
    const cut = cutCandidates.length > 0 ? Math.min(...cutCandidates) : content.length;
    const topLevel = content.slice(0, cut);

    // Extract title. Template interpolations (${...}) render to short runtime
    // values; approximate each as 8 chars so length checks aren't overstated.
    const titleMatch = topLevel.match(/title:\s*['"`]([^'"`]+)['"`]/);
    const title = titleMatch ? titleMatch[1].replace(/\$\{[^}]+\}/g, '12345678') : null;

    const descMatch = topLevel.match(/description:\s*['"`]([^'"`]+)['"`]/);
    const description = descMatch
      ? descMatch[1].replace(/\$\{[^}]+\}/g, '12345678')
      : null;

    // Validate title (reference values like `title: brand.metaTitle` are
    // valid — the strings live in a data module)
    const hasTitleReference = /title:\s*[A-Za-z_$`{]/.test(content);
    if (!title && !hasTitleReference && filePath.endsWith('page.tsx')) {
      // Likely inherited from the root layout's title.default — note, don't fail.
      warnings.push(`${relPath}: No own title (inherits from layout?) — verify`);
    } else if (title && title.length > MAX_TITLE_LENGTH) {
      warnings.push(`${relPath}: Title is ${title.length} chars (recommended max ${MAX_TITLE_LENGTH}): "${title.substring(0, 50)}..."`);
    }

    // Validate description
    const hasDescRef = /description:\s*[A-Za-z_$`{]/.test(content);
    if (!description && !hasDescRef && filePath.endsWith('page.tsx')) {
      warnings.push(`${relPath}: No own description (inherits from layout?) — verify`);
    } else if (description && description.length > MAX_DESCRIPTION_LENGTH) {
      warnings.push(`${relPath}: Description is ${description.length} chars (max ${MAX_DESCRIPTION_LENGTH})`);
    }

    // Check for canonical URL
    if (filePath.endsWith('page.tsx') && !content.includes('canonical')) {
      warnings.push(`${relPath}: No canonical URL set`);
    }

    // Check for openGraph
    if (filePath.endsWith('page.tsx') && !content.includes('openGraph')) {
      warnings.push(`${relPath}: No openGraph metadata`);
    }

    successes++;
    return;
  }

  // No metadata at all
  if (filePath.endsWith('page.tsx')) {
    warnings.push(`${relPath}: No metadata export found`);
  }
}

console.log('\nValidating metadata across all pages...\n');

const appDir = path.join(__dirname, '..', 'src', 'app');
const pageFiles = findPageFiles(appDir);

console.log(`Found ${pageFiles.length} page/layout files\n`);

pageFiles.forEach(validateMetadata);

console.log('\nValidation Results:\n');
console.log(`  Passed:   ${successes} files`);
console.log(`  Warnings: ${warnings.length} flags`);
console.log(`  Skipped:  ${skipped} files (noindex / dynamic / helper-built)`);

if (warnings.length > 0) {
  console.log('\nReview these (not blocking — fixing meta copy is a deliberate SEO edit):\n');
  warnings.forEach(warning => console.log(`  ⚠  ${warning}`));
}

console.log('\nMetadata report complete.\n');
process.exit(0);
