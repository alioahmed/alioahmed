export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
  data?: unknown;
}

export interface FetchOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  rateLimit?: number;
  timeout?: number;
}

export interface InspectionResult {
  url: string;
  verdict: "PASS" | "PARTIAL" | "FAIL" | "NEUTRAL" | "UNKNOWN";
  coverageState: string;
  lastCrawlTime: string | null;
  inspectedAt: string;
}

export interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface QuickWin {
  query: string;
  page: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  reason: string;
}

export interface StrikingDistance {
  query: string;
  page: string;
  position: number;
  impressions: number;
  clicks: number;
}

export interface Cannibalization {
  query: string;
  pages: { url: string; clicks: number; impressions: number; position: number }[];
}

export interface CWVResult {
  lcp: number;
  cls: number;
  fcp: number;
  inp: number;
  performance: number;
  lcpStatus: "good" | "needs-improvement" | "poor";
  inpStatus: "good" | "needs-improvement" | "poor";
}

export interface AuditResult {
  url: string;
  status: number;
  title: string | null;
  titleLength: number;
  description: string | null;
  descriptionLength: number;
  h1: string | null;
  h1Count: number;
  ogTitle: boolean;
  ogDescription: boolean;
  ogImage: boolean;
  schemaTypes: string[];
  brokenLinks: string[];
  imagesWithoutAlt: string[];
  cwv: CWVResult | null;
  dateModified: string | null;
  freshnessIssue: boolean;
  issues: string[];
  severity: "pass" | "warning" | "critical";
}

export interface LLMCitationResult {
  provider: string;
  prompt: string;
  cited: boolean;
  citationContext: string | null;
  fullResponse: string | null;
  checkedAt: string;
}

export interface WeeklySnapshot {
  week: string;
  date: string;
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
  topQueries: SearchAnalyticsRow[];
  topPages: SearchAnalyticsRow[];
  quickWins: QuickWin[];
  strikingDistance: StrikingDistance[];
  cannibalization: Cannibalization[];
}
