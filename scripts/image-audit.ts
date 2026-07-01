/**
 * image-audit.ts
 *
 * Scans `public/images/` and reports every raster image below the
 * Google AI Mode 500×500 minimum (April 2026 spec, per phase-0 0.9).
 *
 * Usage:
 *   npx tsx scripts/image-audit.ts            # report only
 *   npx tsx scripts/image-audit.ts --json     # machine-readable output
 *   npx tsx scripts/image-audit.ts --fix      # batch-upscale below-spec to 500x500 (preserving aspect)
 *
 * Below-spec images are upscaled, not regenerated — original aesthetic
 * preserved. JPEGs use quality 90; PNGs are kept lossless. The script
 * writes upscaled output back to the same path (atomic via tmp + rename).
 */

import * as fs from "fs";
import * as path from "path";

// Lazy-load sharp (an optional native dep) so a missing install yields an
// actionable message instead of an opaque module-not-found crash at import.
// The value is loaded lazily via dynamic import so the process only requires
// the native binary on demand; the factory's type is taken from that import.
type SharpFactory = typeof import("sharp");
let _sharp: SharpFactory | null = null;
async function getSharp(): Promise<SharpFactory> {
  if (_sharp) return _sharp;
  try {
    _sharp = (await import("sharp")).default;
    return _sharp;
  } catch {
    console.error("\n  ! image-audit needs the 'sharp' package. Install it:\n      npm install --save-dev sharp\n");
    process.exit(1);
  }
}

const PROJECT_ROOT = path.resolve(__dirname, "..");
// Personal site keeps images at public/ root (public/images/ is created later).
const IMG_DIR = fs.existsSync(path.join(PROJECT_ROOT, "public", "images"))
  ? path.join(PROJECT_ROOT, "public", "images")
  : path.join(PROJECT_ROOT, "public");
const MIN_DIM = 500;
const FORMATS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

interface Result {
  path: string;
  width: number;
  height: number;
  belowSpec: boolean;
  smallestSide: number;
  bytes: number;
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function audit(): Promise<Result[]> {
  const sharp = await getSharp();
  const results: Result[] = [];
  for await (const file of walk(IMG_DIR)) {
    const ext = path.extname(file).toLowerCase();
    if (!FORMATS.has(ext)) continue;
    try {
      const meta = await sharp(file).metadata();
      const w = meta.width ?? 0;
      const h = meta.height ?? 0;
      const stat = fs.statSync(file);
      const smallestSide = Math.min(w, h);
      results.push({
        path: path.relative(PROJECT_ROOT, file),
        width: w,
        height: h,
        belowSpec: smallestSide < MIN_DIM,
        smallestSide,
        bytes: stat.size,
      });
    } catch (err) {
      console.error(`  ! Failed to read ${file}: ${(err as Error).message}`);
    }
  }
  return results;
}

async function upscale(rel: string): Promise<{ from: { w: number; h: number }; to: { w: number; h: number } } | null> {
  const sharp = await getSharp();
  const full = path.join(PROJECT_ROOT, rel);
  const meta = await sharp(full).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  // Corrupt/unreadable metadata yields 0 — Math.min(w,h)===0 makes scale
  // Infinity and resize() throws. Skip cleanly instead of crashing the batch.
  if (w === 0 || h === 0) {
    console.error(`    .. ${rel}: skipped (unreadable dimensions — width/height reported as 0)`);
    return null;
  }
  const scale = MIN_DIM / Math.min(w, h);
  const newW = Math.round(w * scale);
  const newH = Math.round(h * scale);
  const tmp = `${full}.tmp-${Date.now()}`;
  const ext = path.extname(full).toLowerCase();

  let pipeline = sharp(full).resize(newW, newH, { kernel: "lanczos3" });
  if (ext === ".jpg" || ext === ".jpeg") pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });
  else if (ext === ".png") pipeline = pipeline.png({ compressionLevel: 9 });
  else if (ext === ".webp") pipeline = pipeline.webp({ quality: 90 });

  await pipeline.toFile(tmp);
  fs.renameSync(tmp, full);
  return { from: { w, h }, to: { w: newW, h: newH } };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const jsonOut = args.has("--json");
  const doFix = args.has("--fix");

  console.log("\n  alioahmed — image-audit.ts");
  console.log("  ==========================\n");
  console.log(`  Scanning ${path.relative(PROJECT_ROOT, IMG_DIR)} (min: ${MIN_DIM}×${MIN_DIM})…\n`);

  const results = await audit();
  const below = results.filter((r) => r.belowSpec);
  const total = results.length;

  if (jsonOut) {
    console.log(JSON.stringify({ total, below: below.length, results: below }, null, 2));
    return;
  }

  console.log(`  Total raster images: ${total}`);
  console.log(`  Below ${MIN_DIM}×${MIN_DIM}: ${below.length}\n`);

  if (below.length === 0) {
    console.log("  All images meet the 500×500 minimum. No action needed.\n");
    return;
  }

  console.log("  Below-spec files (sorted by smallest side, ascending):\n");
  below.sort((a, b) => a.smallestSide - b.smallestSide);
  for (const r of below) {
    const sizeKB = (r.bytes / 1024).toFixed(1);
    console.log(`    ${r.path}`);
    console.log(`      ${r.width}×${r.height} — ${sizeKB} KB`);
  }

  if (!doFix) {
    console.log("\n  Re-run with --fix to upscale these to ≥500×500 (Lanczos3, aspect preserved).\n");
    return;
  }

  console.log(`\n  Upscaling ${below.length} files (aspect preserved)…\n`);
  let okCount = 0;
  for (const r of below) {
    try {
      const res = await upscale(r.path);
      if (!res) continue; // skipped (unreadable dimensions) — message already logged
      const { from, to } = res;
      console.log(`    OK ${r.path}  ${from.w}×${from.h} → ${to.w}×${to.h}`);
      okCount++;
    } catch (err) {
      console.error(`    !! ${r.path}: ${(err as Error).message}`);
    }
  }
  console.log(`\n  Upscaled: ${okCount}/${below.length}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
