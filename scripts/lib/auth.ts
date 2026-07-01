import * as fs from "fs";
import * as crypto from "crypto";
import { CONFIG } from "./config";

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri: string;
}

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

export function loadCredentials(): ServiceAccountKey {
  if (!fs.existsSync(CONFIG.credentialsPath)) {
    console.error(`\n  Service account key not found: ${CONFIG.credentialsPath}`);
    console.error("\n  Setup:");
    console.error('  1. Google Cloud Console > Enable "Search Console API"');
    console.error("  2. Create Service Account > Download JSON key");
    console.error(`  3. Save to: ${CONFIG.credentialsPath}`);
    console.error("  4. Add service account email as Owner in GSC\n");
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG.credentialsPath, "utf-8"));
  } catch (e) {
    throw new Error(
      `Service account key at ${CONFIG.credentialsPath} is not valid JSON: ${e instanceof Error ? e.message : e}`,
    );
  }
}

function createJWT(credentials: ServiceAccountKey, scope: string): string {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: credentials.client_email,
    scope,
    aud: credentials.token_uri,
    iat: now,
    exp: now + 3600,
  })}`;
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(unsigned);
  return `${unsigned}.${sign.sign(credentials.private_key, "base64url")}`;
}

export async function getAccessToken(scope: string): Promise<string> {
  const now = Date.now();
  const cached = tokenCache.get(scope);
  if (cached && cached.expiresAt > now + 300000) {
    return cached.token;
  }

  const credentials = loadCredentials();
  const jwt = createJWT(credentials, scope);
  const res = await fetch(credentials.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${error}`);
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Token response missing access_token: ${JSON.stringify(data).slice(0, 200)}`);
  }
  tokenCache.set(scope, {
    token: data.access_token,
    expiresAt: now + (data.expires_in || 3600) * 1000,
  });
  return data.access_token;
}

export const SCOPES = {
  webmasters: "https://www.googleapis.com/auth/webmasters",
  readonly: "https://www.googleapis.com/auth/webmasters.readonly",
  content: "https://www.googleapis.com/auth/content",
} as const;
