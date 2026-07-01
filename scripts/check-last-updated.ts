/**
 * Pre-push check: the freshness system must stay WIRED to git-derived dates.
 *
 * Adapted for this personal-profile site's model. Unlike a commerce site with
 * per-page <LastUpdated /> components, freshness here is CENTRALISED:
 *
 *   git history  →  src/.generated/page-dates.json  (gen:page-dates)
 *                →  src/lib/page-dates.ts            (reads the snapshot)
 *                →  src/lib/content/dates.ts         (pageDates(): git-derived)
 *                →  src/app/sitemap.ts + page schema (lastmod / dateModified)
 *
 * Every page inherits its real, distinct date through pageDates() — no page
 * needs to opt in. So this linter guards the CHAIN rather than each page: if
 * someone reverts pageDates() to a hardcoded blanket date, or the generated
 * snapshot goes missing/invalid, or sitemap.ts stops calling pageDates(), the
 * whole site silently loses honest freshness. This catches that.
 *
 * Exit codes: 0 = wiring intact · 1 = a link in the chain is broken.
 */
import * as fs from "node:fs";
import * as path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..");
const r = (p: string) => path.resolve(REPO_ROOT, p);

interface Check {
  label: string;
  ok: boolean;
  detail: string;
}

function main(): void {
  const checks: Check[] = [];

  // 1. Generated snapshot exists and is valid JSON (Record<string,string>).
  const snapshotPath = r("src/.generated/page-dates.json");
  let snapshotEntries = 0;
  let snapshotOk = false;
  if (!fs.existsSync(snapshotPath)) {
    checks.push({
      label: "page-dates.json present",
      ok: false,
      detail: `${snapshotPath} missing — run 'npm run gen:page-dates'`,
    });
  } else {
    try {
      const parsed = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
      snapshotOk =
        parsed && typeof parsed === "object" && !Array.isArray(parsed) &&
        Object.values(parsed).every((v) => typeof v === "string");
      snapshotEntries = snapshotOk ? Object.keys(parsed).length : 0;
      checks.push({
        label: "page-dates.json valid",
        ok: snapshotOk,
        detail: snapshotOk
          ? `${snapshotEntries} entries (0 is OK on an uncommitted branch — fallback applies)`
          : "not a Record<string,string>",
      });
    } catch (e) {
      checks.push({
        label: "page-dates.json valid",
        ok: false,
        detail: `invalid JSON: ${e instanceof Error ? e.message : e}`,
      });
    }
  }

  // 2. dates.ts derives from git (imports page-dates + calls gitDateForRoute).
  const datesSrc = readOrEmpty(r("src/lib/content/dates.ts"));
  const datesWired =
    /from '@\/lib\/page-dates'/.test(datesSrc) && /gitDateForRoute\s*\(/.test(datesSrc);
  checks.push({
    label: "dates.ts is git-derived",
    ok: datesWired,
    detail: datesWired
      ? "pageDates() reads gitDateForRoute()"
      : "pageDates() no longer reads the git snapshot (reverted to hardcoded dates?)",
  });

  // 3. page-dates.ts imports the generated snapshot.
  const pdSrc = readOrEmpty(r("src/lib/page-dates.ts"));
  const pdWired = /@\/\.generated\/page-dates\.json/.test(pdSrc);
  checks.push({
    label: "page-dates.ts reads snapshot",
    ok: pdWired,
    detail: pdWired ? "imports @/.generated/page-dates.json" : "snapshot import missing",
  });

  // 4. sitemap.ts still emits per-route lastmod via pageDates().
  const sitemapSrc = readOrEmpty(r("src/app/sitemap.ts"));
  const sitemapWired = /pageDates\s*\(/.test(sitemapSrc);
  checks.push({
    label: "sitemap.ts uses pageDates()",
    ok: sitemapWired,
    detail: sitemapWired ? "lastModified from pageDates()" : "sitemap no longer calls pageDates()",
  });

  console.log("[check-last-updated] freshness-chain wiring:\n");
  let failed = 0;
  for (const c of checks) {
    console.log(`  ${c.ok ? "OK  " : "FAIL"} ${c.label} — ${c.detail}`);
    if (!c.ok) failed++;
  }
  console.log("");
  if (failed > 0) {
    console.error(`[check-last-updated] FAIL — ${failed} broken link(s) in the freshness chain.`);
    console.error("  Fix the chain (git → page-dates.json → page-dates.ts → dates.ts → sitemap.ts)");
    console.error("  so every route keeps a real, git-derived lastmod. See scripts/check-last-updated.ts.");
    process.exit(1);
  }
  console.log("[check-last-updated] OK — freshness chain intact; all routes inherit git-derived dates.");
}

function readOrEmpty(p: string): string {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

main();
