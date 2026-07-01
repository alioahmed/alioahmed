import * as fs from "fs";
import * as path from "path";

/**
 * Central config for every SEO/GEO/AEO operations script.
 *
 * This is a PERSONAL-PROFILE site (Ali Ahmed), not a commerce site — so there
 * are no products, banned words, or WhatsApp coupling here. Everything that a
 * script needs (host, credentials, sample pages, niche terms) is centralised
 * so scripts stay generic and sitemap-driven.
 *
 * Secrets/credentials are read from the environment and left DORMANT when
 * absent — scripts that need them must fail gracefully with a clear
 * `::notice::` rather than crash (see the deferred submission/report scripts).
 */

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://alioahmed.vercel.app").replace(
  /\/$/,
  "",
);
const HOST = (() => {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return "alioahmed.vercel.app";
  }
})();

export const CONFIG = {
  // Identity / origin ---------------------------------------------------------
  name: "Ali Ahmed",
  siteUrl: SITE_URL,
  host: HOST,

  // Google Search Console — sc-domain: property (env-driven, dormant until set).
  gscSite: process.env.GSC_SITE ?? `sc-domain:${HOST}`,

  // Bing Webmaster Tools API key (dormant until BING_API_KEY is set).
  bingApiKey: process.env.BING_API_KEY ?? "",

  // GA4 property id, e.g. "properties/123456789" or the bare number (dormant).
  ga4PropertyId: process.env.GA4_PROPERTY_ID ?? "",

  // PageSpeed Insights API key — OPTIONAL. PSI works keyless at low volume,
  // so this stays blank and the CWV engine degrades gracefully without it.
  pageSpeedApiKey: process.env.PAGESPEED_API_KEY ?? "",

  /**
   * IndexNow key. Preference order:
   *   1. process.env.INDEXNOW_KEY
   *   2. a public/<key>.txt file whose basename == its trimmed contents
   * Returns null when neither exists — callers must no-op with a clear notice
   * (never throw); IndexNow is deferred until deploy + a real key.
   */
  get indexNowKey(): string | null {
    if (process.env.INDEXNOW_KEY) return process.env.INDEXNOW_KEY.trim();
    try {
      const pubDir = path.join(PROJECT_ROOT, "public");
      for (const f of fs.readdirSync(pubDir)) {
        if (!f.endsWith(".txt") || f === "llms.txt" || f === "llms-full.txt") continue;
        const base = f.replace(/\.txt$/, "");
        const body = fs.readFileSync(path.join(pubDir, f), "utf-8").trim();
        if (body === base && /^[a-zA-Z0-9-]{8,}$/.test(base)) return base;
      }
    } catch {
      /* public/ unreadable — treat as absent */
    }
    return null;
  },

  // Google service-account JSON for GSC/Indexing API (dormant until present).
  credentialsPath:
    process.env.GOOGLE_APPLICATION_CREDENTIALS ??
    path.join(PROJECT_ROOT, "credentials", "google-service-account.json"),
  logsDir: path.join(PROJECT_ROOT, "logs"),

  // API endpoints -------------------------------------------------------------
  indexNowEndpoint: "https://api.indexnow.org/indexnow",
  gscBaseUrl: "https://www.googleapis.com/webmasters/v3",
  gscInspectUrl: "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
  pageSpeedUrl: "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",

  gscInspectionDailyLimit: 2000,
  indexNowBatchSize: 10000,
} as const;

/**
 * Minimal static-page fallback for pages.ts getAuditPages() when the sitemap
 * is unreachable. The sitemap is the real source of truth (it grows with the
 * content phase); this is only a loud last resort. Currently just the home
 * route (the one live route in navigation.ts).
 */
export const STATIC_PAGES: string[] = ["/"];

/**
 * Representative pages for the SAMPLE-based audits (answer-structure,
 * freshness-drift) that check a handful of pages rather than the whole
 * sitemap. Keep in lockstep with what is actually LIVE. As content ships,
 * add the new routes here.
 */
export const SAMPLE_PAGES: string[] = ["/"];

/**
 * Ali Ahmed's niche/entity terms — used by the (dormant) AI-visibility trackers
 * (ai-overview-track, llm-check) to detect whether an answer engine cites him.
 */
export const NICHE_TERMS: string[] = [
  "Ali Ahmed",
  "AI Solutions Engineer",
  "Cognilium AI",
  "Bijli Bachao",
  "LLM",
  "RAG",
  "AI agents",
  "alioahmed",
];

export function getAllPages(): string[] {
  return [...STATIC_PAGES];
}

export function getFullUrl(pagePath: string): string {
  return `${CONFIG.siteUrl}${pagePath}`;
}
