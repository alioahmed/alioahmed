import { CONFIG } from "./config";
import { fetchWithRetry } from "./fetcher";

/**
 * Single source of truth for IndexNow submission.
 *
 * Why: indexnow-submit.ts and indexnow-on-change.ts each used to carry their
 * own endpoint list + body builder + submit logic. They were in sync by hand
 * — one careless edit (e.g. adding a 7th engine to one file only) and they
 * drift. One list, one body builder, one submit function, shared by both.
 */
export const INDEXNOW_ENDPOINTS = [
  { name: "IndexNow (shared)", url: "https://api.indexnow.org/indexnow" },
  { name: "Bing (direct)", url: "https://www.bing.com/indexnow" },
  { name: "Yandex (direct)", url: "https://yandex.com/indexnow" },
  { name: "Naver (direct)", url: "https://searchadvisor.naver.com/indexnow" },
  { name: "Seznam (direct)", url: "https://search.seznam.cz/indexnow" },
  { name: "Yep (direct)", url: "https://indexnow.yep.com/indexnow" },
] as const;

export interface IndexNowResult {
  name: string;
  status: number;
  ok: boolean;
}

export function buildIndexNowBody(urls: string[]): string {
  const key = CONFIG.indexNowKey;
  if (!key) {
    // Guard: IndexNow is dormant until a key exists (env INDEXNOW_KEY or a
    // public/<key>.txt file). Callers should check hasIndexNowKey() and no-op
    // with a clear notice before reaching this point.
    throw new Error(
      "IndexNow key absent — set INDEXNOW_KEY or add public/<key>.txt before submitting.",
    );
  }
  const host = CONFIG.host;
  return JSON.stringify({
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: urls,
  });
}

/** Submit a URL batch to one endpoint. 200/202 = accepted. */
export async function submitToIndexNowEndpoint(
  endpoint: { name: string; url: string },
  urls: string[],
  opts: { timeout?: number; maxRetries?: number } = {},
): Promise<IndexNowResult> {
  try {
    const res = await fetchWithRetry(
      endpoint.url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: buildIndexNowBody(urls),
      },
      { timeout: opts.timeout ?? 30000, maxRetries: opts.maxRetries ?? 2 },
    );
    return { name: endpoint.name, status: res.status, ok: res.status === 200 || res.status === 202 };
  } catch {
    return { name: endpoint.name, status: 0, ok: false };
  }
}

/** Submit one batch to ALL endpoints concurrently. Never rejects. */
export async function submitToAllEndpoints(
  urls: string[],
  opts: { timeout?: number; maxRetries?: number } = {},
): Promise<IndexNowResult[]> {
  const settled = await Promise.allSettled(
    INDEXNOW_ENDPOINTS.map((e) => submitToIndexNowEndpoint(e, urls, opts)),
  );
  return settled.map((r, i) =>
    r.status === "fulfilled" ? r.value : { name: INDEXNOW_ENDPOINTS[i].name, status: 0, ok: false },
  );
}
