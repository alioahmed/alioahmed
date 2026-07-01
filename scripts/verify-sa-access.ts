import * as fs from "fs";
import { getAccessToken, SCOPES } from "./lib/auth";
import { CONFIG } from "./lib/config";
import { fetchWithRetry } from "./lib/fetcher";

const GA4_PROPERTY_ID = CONFIG.ga4PropertyId; // env-driven; blank = GA4 check skipped
const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

// Preflight: confirm the service-account JSON exists and is well-formed BEFORE
// we make API calls — otherwise a missing/garbled key surfaces as a confusing
// auth error deep in the GSC/GA4 calls instead of a clear "fix the file here".
// Returns the parsed client_email on success, or null on any failure. Callers
// use the returned email as the single source of truth for the SA identity so
// it can't drift from a hardcoded literal.
function checkCredentials(): string | null {
  try {
    const json = JSON.parse(fs.readFileSync(CONFIG.credentialsPath, "utf-8"));
    if (!json.client_email) {
      console.log(`  CREDS FAIL  ${CONFIG.credentialsPath} has no client_email field`);
      return null;
    }
    console.log(`  CREDS OK    ${json.client_email}`);
    return json.client_email as string;
  } catch (e) {
    console.log(`  CREDS FAIL  cannot read ${CONFIG.credentialsPath}`);
    console.log(`             ${e instanceof Error ? e.message : e}`);
    console.log(`             → put the service-account JSON there (it's gitignored).`);
    return null;
  }
}

async function checkGSC(): Promise<boolean> {
  const token = await getAccessToken(SCOPES.readonly);
  const res = await fetchWithRetry(
    `${CONFIG.gscBaseUrl}/sites`,
    { headers: { Authorization: `Bearer ${token}` } },
    { maxRetries: 2, timeout: 20000 },
  );
  if (!res.ok) {
    console.log(`  GSC FAIL  ${res.status} ${await res.text()}`);
    console.log(`           → Search Console → Settings → Users and permissions →`);
    console.log(`             add the service-account email as an Owner.`);
    return false;
  }
  const data = await res.json();
  const sites: { siteUrl: string; permissionLevel: string }[] = data.siteEntry ?? [];
  const ours = sites.find((s) => s.siteUrl === CONFIG.gscSite);
  if (!ours) {
    console.log(`  GSC FAIL  Service account not listed on ${CONFIG.gscSite}`);
    console.log(`           Visible sites: ${sites.map((s) => s.siteUrl).join(", ") || "(none)"}`);
    console.log(`           → add the SA email as an Owner of ${CONFIG.gscSite}.`);
    return false;
  }
  console.log(`  GSC OK    ${ours.siteUrl} — permission: ${ours.permissionLevel}`);
  return true;
}

async function checkGA4(): Promise<boolean> {
  const token = await getAccessToken(GA4_SCOPE);
  const res = await fetchWithRetry(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        dimensions: [{ name: "date" }],
        limit: 3,
      }),
    },
    { maxRetries: 2, timeout: 20000 },
  );
  if (!res.ok) {
    console.log(`  GA4 FAIL  ${res.status} ${await res.text()}`);
    console.log(`           → GA4 Admin → Property Access Management →`);
    console.log(`             add the SA email as a Viewer on property ${GA4_PROPERTY_ID}.`);
    return false;
  }
  const data = await res.json();
  const rowCount = data.rowCount ?? 0;
  const rows = data.rows ?? [];
  const sample = rows.slice(0, 3).map((r: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }) => {
    const date = r.dimensionValues[0].value;
    const sessions = r.metricValues[0].value;
    const users = r.metricValues[1].value;
    return `${date}: ${sessions} sessions, ${users} users`;
  });
  console.log(`  GA4 OK    property ${GA4_PROPERTY_ID} — ${rowCount} rows`);
  sample.forEach((s: string) => console.log(`           ${s}`));
  return true;
}

async function main(): Promise<void> {
  console.log("\nService account access check");
  if (!fs.existsSync(CONFIG.credentialsPath)) {
    console.log(
      `::notice:: [verify-sa-access] No service-account JSON at ${CONFIG.credentialsPath}. Dormant — nothing to verify yet.`,
    );
    return;
  }
  const clientEmail = checkCredentials();
  if (!clientEmail) {
    console.log("\n  Credentials present but invalid — fix the JSON above.\n");
    process.exit(1);
  }
  // Print the SA identity parsed from the creds file — not a hardcoded literal
  // that can silently go stale when the service account is rotated.
  console.log(`  Email: ${clientEmail}\n`);
  const gscOk = await checkGSC();
  const ga4Ok = GA4_PROPERTY_ID ? await checkGA4() : true;
  if (!GA4_PROPERTY_ID) {
    console.log("  GA4 SKIP  GA4_PROPERTY_ID not set — skipping GA4 access check.");
  }
  console.log();
  if (!gscOk || !ga4Ok) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
