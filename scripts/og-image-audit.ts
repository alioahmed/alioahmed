#!/usr/bin/env tsx
/**
 * OG image audit — verifies every indexable page emits a working
 * Open Graph image of the right dimensions.
 *
 * Why this exists separately from schema-audit.ts:
 *   schema-audit only checks that `og:image` *exists* in the HTML — not
 *   whether the URL actually resolves, returns 200, is the right
 *   dimensions, or is reachable to the bot. AI engines and social
 *   crawlers skip cards entirely when the og:image is broken, and
 *   Google's social-card previews silently fall back to the next image
 *   on the page — usually something off-brand.
 *
 * Checks per page:
 *   1. og:image is set
 *   2. og:image URL returns 200
 *   3. Content-Type is image/*
 *   4. Reported dimensions are at least 1200×630 (Facebook's minimum,
 *      Twitter's preferred Large Card minimum; smaller works but causes
 *      crop on most platforms)
 *   5. Content-Length under 5 MB (Facebook caps; LinkedIn caps at 5 MB)
 *
 * Run against PRODUCTION — og:image URLs are absolute prod/CDN URLs.
 *
 * Usage:
 *   npx tsx scripts/og-image-audit.ts                              # prod (default)
 *   BASE_URL=http://localhost:3000 npx tsx scripts/og-image-audit.ts
 */

import { fetchWithRetry } from "./lib/fetcher";
import { CONFIG } from "./lib/config";
import { getAuditPages } from "./lib/pages";

const BASE_URL = process.env.BASE_URL?.replace(/\/$/, "") ?? CONFIG.siteUrl;
const MIN_W = 1200;
const MIN_H = 630;
const MAX_BYTES = 5 * 1024 * 1024;

interface Result {
  page: string;
  ogImage: string | null;
  status: number;
  contentType: string | null;
  bytes: number;
  width?: number;
  height?: number;
  issues: string[];
}

const OG_RE = /<meta\s+property=["']og:image(?::secure_url)?["']\s+content=["']([^"']+)["']/i;

async function fetchOgImage(page: string): Promise<string | null> {
  const res = await fetchWithRetry(`${BASE_URL}${page}`, { redirect: "follow" }, { maxRetries: 1 });
  if (!res.ok) return null;
  const html = await res.text();
  const m = html.match(OG_RE);
  return m ? m[1] : null;
}

/* Read PNG/JPEG dimensions from the first ~64KB of the file via HEAD-then-
   range-GET. Pure JS so we don't drag in sharp for the audit step. */
async function readImageDims(url: string): Promise<{ status: number; contentType: string | null; bytes: number; width?: number; height?: number }> {
  // First HEAD to get content-length + content-type
  let head: Response;
  try {
    head = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(15000) });
  } catch {
    return { status: 0, contentType: null, bytes: 0 };
  }
  const contentType = head.headers.get("content-type");
  const bytes = Number(head.headers.get("content-length") ?? 0);
  if (!head.ok) {
    return { status: head.status, contentType, bytes };
  }
  // Range-GET first 64KB to parse dims
  try {
    const body = await fetch(url, { headers: { Range: "bytes=0-65535" }, signal: AbortSignal.timeout(15000) });
    const buf = Buffer.from(await body.arrayBuffer());
    const dims = parseDims(buf);
    return { status: head.status, contentType, bytes, ...dims };
  } catch {
    return { status: head.status, contentType, bytes };
  }
}

function parseDims(buf: Buffer): { width?: number; height?: number } {
  // PNG: 8-byte sig + IHDR chunk; width at offset 16, height at offset 20
  if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG: walk SOFn markers
  if (buf.length > 2 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 8) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      // Standalone markers carry NO length field: TEM (0x01) and the restart
      // markers RST0–RST7 (0xD0–0xD9). Reading a 2-byte length for these
      // desyncs the walk. Advance past the 2-byte marker and continue.
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) { i += 2; continue; }
      // SOF0–SOF15 except SOF4/8/12 (which are DHT/JPG/DAC), per spec
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        const height = buf.readUInt16BE(i + 5);
        const width = buf.readUInt16BE(i + 7);
        return { width, height };
      }
      const segLen = buf.readUInt16BE(i + 2);
      i += 2 + segLen;
    }
  }
  // WebP: RIFF/WEBP/VP8X chunk (extended) has 24-bit width/height at offset 24
  if (buf.length >= 30 && buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP") {
    const chunk = buf.slice(12, 16).toString();
    if (chunk === "VP8X") {
      const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
      const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
      return { width: w, height: h };
    }
    if (chunk === "VP8 ") {
      // Simple WebP: VP8 frame; dims at offset 26 (after sync code)
      if (buf.length >= 30) {
        const w = buf.readUInt16LE(26) & 0x3fff;
        const h = buf.readUInt16LE(28) & 0x3fff;
        return { width: w, height: h };
      }
    }
    if (chunk === "VP8L") {
      // Lossless WebP: chunk payload begins at offset 20 with a 0x2f signature
      // byte, then 14-bit width and 14-bit height packed little-endian into the
      // next 4 bytes (each dimension stored minus one).
      if (buf.length >= 25 && buf[20] === 0x2f) {
        const b1 = buf[21], b2 = buf[22], b3 = buf[23], b4 = buf[24];
        const w = (b1 | ((b2 & 0x3f) << 8)) + 1;
        const h = ((b2 >> 6) | (b3 << 2) | ((b4 & 0x0f) << 10)) + 1;
        return { width: w, height: h };
      }
    }
  }
  return {};
}

async function audit(page: string): Promise<Result> {
  const result: Result = {
    page,
    ogImage: null,
    status: 0,
    contentType: null,
    bytes: 0,
    issues: [],
  };
  const og = await fetchOgImage(page);
  if (!og) {
    result.issues.push("og:image meta tag missing");
    return result;
  }
  result.ogImage = og;
  const dims = await readImageDims(og);
  Object.assign(result, dims);
  if (dims.status === 0) {
    result.issues.push("og:image URL unreachable (network error)");
  } else if (dims.status >= 400) {
    result.issues.push(`og:image returns HTTP ${dims.status}`);
  }
  if (dims.contentType && !dims.contentType.startsWith("image/")) {
    result.issues.push(`og:image content-type is "${dims.contentType}" (expected image/*)`);
  }
  if (dims.bytes && dims.bytes > MAX_BYTES) {
    result.issues.push(`og:image is ${(dims.bytes / 1024 / 1024).toFixed(1)}MB (>5MB limit; LinkedIn rejects)`);
  }
  if (dims.width !== undefined && dims.height !== undefined) {
    if (dims.width < MIN_W || dims.height < MIN_H) {
      result.issues.push(`og:image is ${dims.width}x${dims.height} (Facebook/Twitter Large Card minimum is ${MIN_W}x${MIN_H})`);
    }
  } else if (dims.status >= 200 && dims.status < 400) {
    result.issues.push("og:image dimensions unreadable (couldn't parse PNG/JPEG/WebP header)");
  }
  return result;
}

async function main(): Promise<void> {
  console.log(`[og-image-audit] BASE_URL=${BASE_URL}`);
  const results: Result[] = [];
  const pages = await getAuditPages();
  console.log(`[og-image-audit] auditing ${pages.length} pages (sitemap-driven)`);
  for (const page of pages) {
    const r = await audit(page);
    results.push(r);
    const flag = r.issues.length === 0 ? "OK  " : "FAIL";
    const dims = r.width && r.height ? `${r.width}x${r.height}` : "—";
    console.log(`  ${flag} ${page.padEnd(50)} ${dims}`);
    if (r.issues.length > 0) {
      for (const issue of r.issues) console.log(`       ${issue}`);
    }
  }
  const failures = results.filter((r) => r.issues.length > 0);
  console.log("");
  if (failures.length > 0) {
    console.error(`[og-image-audit] FAIL — ${failures.length}/${results.length} pages have og:image issues.`);
    process.exit(1);
  }
  console.log(`[og-image-audit] OK — all ${results.length} pages have a working og:image at >=${MIN_W}x${MIN_H}.`);
}

main().catch((err) => {
  console.error(`[og-image-audit] crash: ${(err as Error).message}`);
  process.exit(2);
});
