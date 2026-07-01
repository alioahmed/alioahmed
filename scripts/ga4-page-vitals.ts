/**
 * GA4 Page Vitals — alioahmed
 *
 * Pulls real-user Core Web Vitals (LCP, INP, CLS, FCP, TTFB) from GA4 via the
 * web_vitals event captured by src/components/providers/WebVitals.tsx.
 *
 * GA4 free tier only exposes averages (not p75 — Google's ranking metric).
 * For p75, you'd need BigQuery export. Average is a usable proxy until then.
 *
 * USAGE:
 *   npx tsx scripts/ga4-page-vitals.ts             — last 7d
 *   npx tsx scripts/ga4-page-vitals.ts 28          — last 28d
 *   npx tsx scripts/ga4-page-vitals.ts --help
 */

import * as fs from "fs";
import * as path from "path";
import { getAccessToken } from "./lib/auth";
import { fetchWithRetry } from "./lib/fetcher";
import { CONFIG } from "./lib/config";

const GA4_PROPERTY_ID = CONFIG.ga4PropertyId; // env-driven; blank = dormant
const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const GA4_BASE = "https://analyticsdata.googleapis.com/v1beta";

const HELP = `
  alioahmed — GA4 Page Vitals (real-user CWV)

  Usage:
    npx tsx scripts/ga4-page-vitals.ts             Last 7 days
    npx tsx scripts/ga4-page-vitals.ts <days>      Custom window (e.g. 28)

  Output:
    Terminal table + markdown report at docs/reports/ga4-vitals-YYYY-MM-DD.md
`;

interface VitalsRow {
  page: string;
  metric: string;       // LCP, INP, CLS, FCP, TTFB
  rating: string;       // good, needs-improvement, poor
  eventCount: number;
  avgValue: number;
}

interface GA4DimensionValue {
  value: string;
}

interface GA4MetricValue {
  value: string;
}

interface GA4Row {
  dimensionValues: GA4DimensionValue[];
  metricValues: GA4MetricValue[];
}

async function queryGA4(body: object): Promise<{ rows: GA4Row[]; rowCount: number }> {
  const token = await getAccessToken(GA4_SCOPE);
  const res = await fetchWithRetry(
    `${GA4_BASE}/properties/${GA4_PROPERTY_ID}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    { maxRetries: 2, timeout: 30000 },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GA4 Data API error: ${res.status} — ${text}`);
  }
  const data = await res.json();
  return { rows: data.rows ?? [], rowCount: data.rowCount ?? 0 };
}

async function pullVitals(days: number): Promise<VitalsRow[]> {
  const { rows } = await queryGA4({
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: [
      { name: "pagePath" },
      { name: "customEvent:metric_name" },
      { name: "customEvent:metric_rating" },
    ],
    metrics: [
      { name: "eventCount" },
      { name: "eventValue" },
    ],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        stringFilter: { matchType: "EXACT", value: "web_vitals" },
      },
    },
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 1000,
  });

  const out: VitalsRow[] = [];
  for (const r of rows) {
    // GA4 can return rows missing dimension/metric entries (or with fewer than
    // requested). Guard every index so a short row doesn't throw on `.value`.
    const dims = r.dimensionValues ?? [];
    const mets = r.metricValues ?? [];
    // Normalise the metric_name dimension. GA4 reports unset custom dims as
    // "(not set)"; collapse blanks/missing to that single sentinel so the
    // forward-only-dimensions detector (detectNotSetState) still fires AND so
    // summarizeByPage can keep these out of per-metric stats without leaking
    // partially-set rows into named-metric columns.
    const rawMetric = dims[1]?.value;
    const metric = !rawMetric || rawMetric === "" ? "(not set)" : rawMetric;

    const eventCount = parseInt(mets[0]?.value ?? "", 10) || 0;
    const sumValue = parseFloat(mets[1]?.value ?? "") || 0;
    let avgValue = eventCount > 0 ? sumValue / eventCount : 0;
    // CLS was ×1000 on the way in (see WebVitals.tsx). Restore to unitless ratio.
    if (metric === "CLS") avgValue = avgValue / 1000;
    out.push({
      page: dims[0]?.value ?? "(unknown)",
      metric,
      rating: dims[2]?.value ?? "",
      eventCount,
      avgValue,
    });
  }
  return out;
}

// Google CWV "good" thresholds.
const THRESHOLDS_GOOD: Record<string, number> = {
  LCP: 2500, INP: 200, CLS: 0.1, FCP: 1800, TTFB: 800,
};
const THRESHOLDS_POOR: Record<string, number> = {
  LCP: 4000, INP: 500, CLS: 0.25, FCP: 3000, TTFB: 1800,
};

function statusFor(metric: string, value: number): string {
  const good = THRESHOLDS_GOOD[metric];
  const poor = THRESHOLDS_POOR[metric];
  if (good === undefined) return "?";
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

function formatValue(metric: string, value: number): string {
  if (metric === "CLS") return value.toFixed(3);
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
  return `${Math.round(value)}ms`;
}

interface PageSummary {
  page: string;
  totalEvents: number;
  metrics: Record<string, { avg: number; status: string; events: number }>;
}

function summarizeByPage(rows: VitalsRow[]): PageSummary[] {
  const byPage = new Map<string, PageSummary>();
  for (const r of rows) {
    if (!byPage.has(r.page)) {
      byPage.set(r.page, { page: r.page, totalEvents: 0, metrics: {} });
    }
    const p = byPage.get(r.page)!;
    p.totalEvents += r.eventCount;
    // Count unset rows toward totalEvents (so detectNotSetState can see them)
    // but never give them a metric entry — that's the pollution we're avoiding.
    if (r.metric === "(not set)" || r.metric === "") continue;
    // If this metric already has data from another rating row, weighted-merge.
    const existing = p.metrics[r.metric];
    if (existing) {
      const combinedEvents = existing.events + r.eventCount;
      const combinedAvg =
        (existing.avg * existing.events + r.avgValue * r.eventCount) / combinedEvents;
      p.metrics[r.metric] = {
        avg: combinedAvg,
        status: statusFor(r.metric, combinedAvg),
        events: combinedEvents,
      };
    } else {
      p.metrics[r.metric] = {
        avg: r.avgValue,
        status: statusFor(r.metric, r.avgValue),
        events: r.eventCount,
      };
    }
  }
  return Array.from(byPage.values()).sort((a, b) => b.totalEvents - a.totalEvents);
}

function detectNotSetState(summaries: PageSummary[]): boolean {
  // If every page has events but none have any named metric (LCP/INP/CLS/FCP/TTFB),
  // every dimension value is "(not set)" — i.e. custom dimensions were registered
  // AFTER these events were processed. GA4 is forward-only on custom dims.
  if (summaries.length === 0) return false;
  return summaries.every(
    (s) => s.totalEvents > 0 && Object.keys(s.metrics).every((k) => k === "(not set)" || k === ""),
  );
}

function printTerminal(summaries: PageSummary[], days: number): void {
  console.log(`\n  GA4 Page Vitals — last ${days}d (real-user CWV)\n`);
  if (summaries.length === 0) {
    console.log("  No web_vitals events yet.");
    console.log("  Either:");
    console.log("  - Not enough traffic in window");
    console.log("  - Custom dimensions metric_name / metric_rating not registered in GA4 admin");
    console.log("    Admin → Custom definitions → Create event-scoped dimension for each\n");
    return;
  }
  if (detectNotSetState(summaries)) {
    console.log("  ⚠  Custom dimensions registered, but every event in this window is (not set).");
    console.log("     GA4 indexes custom dimensions FORWARD-ONLY — no backfill.");
    console.log(`     Events recorded: ${summaries.reduce((a, b) => a + b.totalEvents, 0)} across ${summaries.length} pages.`);
    console.log("     Wait 24-48h for fresh events to flow with populated dimensions, then re-run.\n");
    console.log("  Top pages by event volume (so far):");
    console.log("  " + "Page".padEnd(50) + "Events");
    console.log("  " + "-".repeat(60));
    for (const s of summaries.slice(0, 15)) {
      console.log("  " + s.page.substring(0, 48).padEnd(50) + String(s.totalEvents));
    }
    console.log();
    return;
  }

  // Header
  const cols = ["Page", "Events", "LCP", "INP", "CLS", "FCP", "TTFB"];
  const widths = [42, 8, 10, 9, 8, 9, 9];
  console.log("  " + cols.map((c, i) => c.padEnd(widths[i])).join(""));
  console.log("  " + "-".repeat(widths.reduce((a, b) => a + b, 0)));

  for (const s of summaries.slice(0, 25)) {
    const row = [
      s.page.substring(0, 40),
      String(s.totalEvents),
      s.metrics.LCP ? `${formatValue("LCP", s.metrics.LCP.avg)} ${s.metrics.LCP.status === "good" ? "✓" : s.metrics.LCP.status === "poor" ? "✗" : "~"}` : "-",
      s.metrics.INP ? `${formatValue("INP", s.metrics.INP.avg)} ${s.metrics.INP.status === "good" ? "✓" : s.metrics.INP.status === "poor" ? "✗" : "~"}` : "-",
      s.metrics.CLS ? `${formatValue("CLS", s.metrics.CLS.avg)} ${s.metrics.CLS.status === "good" ? "✓" : s.metrics.CLS.status === "poor" ? "✗" : "~"}` : "-",
      s.metrics.FCP ? `${formatValue("FCP", s.metrics.FCP.avg)} ${s.metrics.FCP.status === "good" ? "✓" : s.metrics.FCP.status === "poor" ? "✗" : "~"}` : "-",
      s.metrics.TTFB ? `${formatValue("TTFB", s.metrics.TTFB.avg)} ${s.metrics.TTFB.status === "good" ? "✓" : s.metrics.TTFB.status === "poor" ? "✗" : "~"}` : "-",
    ];
    console.log("  " + row.map((c, i) => c.padEnd(widths[i])).join(""));
  }
  console.log();
}

function buildMarkdown(summaries: PageSummary[], days: number): string {
  const lines: string[] = [];
  const date = new Date().toISOString().split("T")[0];
  lines.push(`# GA4 Page Vitals — ${date}`);
  lines.push("");
  lines.push(`**Window:** last ${days} days`);
  lines.push(`**Source:** real-user CWV from \`web_vitals\` GA4 event`);
  lines.push(`**Note:** values are AVERAGE per page (not p75). For p75 — what Google ranks on — we'd need BigQuery export.`);
  lines.push("");

  if (summaries.length === 0) {
    lines.push("_No web_vitals events recorded in this window. Confirm GA4 custom dimensions `metric_name` and `metric_rating` are registered._");
    return lines.join("\n");
  }
  if (detectNotSetState(summaries)) {
    lines.push("> ⚠  **Custom dimensions registered, but every event in this window is `(not set)`.**");
    lines.push(">");
    lines.push("> GA4 indexes custom dimensions **forward-only** — no backfill for past events.");
    lines.push(`> ${summaries.reduce((a, b) => a + b.totalEvents, 0)} events across ${summaries.length} pages were recorded before the dimensions were registered.`);
    lines.push("> Wait 24-48h for fresh events to flow with populated dimensions, then re-run.");
    lines.push("");
    lines.push("## Top pages by event volume (during the (not set) window)");
    lines.push("");
    lines.push("| Page | Events |");
    lines.push("|---|---|");
    for (const s of summaries.slice(0, 20)) {
      lines.push(`| \`${s.page}\` | ${s.totalEvents} |`);
    }
    return lines.join("\n");
  }

  lines.push("## Top pages by web_vitals event volume");
  lines.push("");
  lines.push("| Page | Events | LCP | INP | CLS | FCP | TTFB |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const s of summaries.slice(0, 25)) {
    const cell = (m: string) =>
      s.metrics[m]
        ? `${formatValue(m, s.metrics[m].avg)} (${s.metrics[m].status})`
        : "-";
    lines.push(`| \`${s.page}\` | ${s.totalEvents} | ${cell("LCP")} | ${cell("INP")} | ${cell("CLS")} | ${cell("FCP")} | ${cell("TTFB")} |`);
  }
  lines.push("");

  // Surface pages with poor field LCP — Google's ranking signal
  const poorLCP = summaries.filter((s) => s.metrics.LCP?.status === "poor");
  if (poorLCP.length > 0) {
    lines.push("## Pages with POOR field LCP (>4s)");
    lines.push("");
    lines.push("These pages are likely being demoted by Google. Fix first.");
    lines.push("");
    lines.push("| Page | LCP avg | Events |");
    lines.push("|---|---|---|");
    poorLCP.forEach((s) => {
      lines.push(`| \`${s.page}\` | ${formatValue("LCP", s.metrics.LCP.avg)} | ${s.metrics.LCP.events} |`);
    });
    lines.push("");
  }

  lines.push("---");
  lines.push(`_Generated by \`scripts/ga4-page-vitals.ts\` on ${new Date().toISOString()}_`);
  return lines.join("\n");
}

function saveMarkdown(content: string): string {
  const dir = path.join(path.resolve(__dirname, ".."), "docs", "reports");
  fs.mkdirSync(dir, { recursive: true });
  const date = new Date().toISOString().split("T")[0];
  const filepath = path.join(dir, `ga4-vitals-${date}.md`);
  fs.writeFileSync(filepath, content);
  return filepath;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args[0] === "--help" || args[0] === "-h") {
    console.log(HELP);
    return;
  }
  // DORMANT guard: no GA4 property or no service-account creds → no-op notice.
  if (!GA4_PROPERTY_ID || !fs.existsSync(CONFIG.credentialsPath)) {
    console.log(
      "::notice:: [ga4-page-vitals] GA4_PROPERTY_ID and/or Google service-account credentials not configured. Skipping — dormant until GA4 access is set up.",
    );
    return;
  }

  const days = parseInt(args[0] || "7", 10);
  if (!Number.isFinite(days) || days < 1 || days > 365) {
    console.error("days must be 1-365");
    process.exit(1);
  }

  console.log("\n  alioahmed — GA4 Page Vitals");
  console.log("  ================================");

  let rows: VitalsRow[];
  try {
    rows = await pullVitals(days);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("metric_name") || msg.includes("custom") || msg.includes("dimension")) {
      console.error(`\n  GA4 query failed — custom dimensions likely not registered.`);
      console.error(`  In GA4 admin: Custom definitions → Create custom dimension`);
      console.error(`    1. Dimension name: metric_name | Event parameter: metric_name | Scope: Event`);
      console.error(`    2. Dimension name: metric_rating | Event parameter: metric_rating | Scope: Event`);
      console.error(`  Wait ~1h for GA4 to index, then re-run.\n`);
      console.error(`  Raw error: ${msg}\n`);
      process.exit(1);
    }
    throw e;
  }

  const summaries = summarizeByPage(rows);
  printTerminal(summaries, days);

  const md = buildMarkdown(summaries, days);
  const mdPath = saveMarkdown(md);
  console.log(`  Markdown report: ${path.relative(process.cwd(), mdPath)}\n`);
}

main().catch((err) => {
  console.error(`\n  Fatal error: ${err.message}`);
  process.exit(1);
});
