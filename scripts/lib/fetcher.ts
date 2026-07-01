import type { FetchOptions } from "./types";

const DEFAULT: Required<FetchOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  rateLimit: 0,
  timeout: 30000,
};

const timestamps: number[] = [];

async function waitForRateLimit(perMinute: number): Promise<void> {
  if (perMinute <= 0) return;
  const now = Date.now();
  while (timestamps.length > 0 && timestamps[0] < now - 60000) timestamps.shift();
  if (timestamps.length >= perMinute) {
    const waitMs = timestamps[0] + 60000 - now;
    if (waitMs > 0) await new Promise((r) => setTimeout(r, waitMs));
  }
  timestamps.push(Date.now());
}

// Equal jitter exponential backoff per AWS Architecture Blog:
// delay = halfExp + random(0, halfExp)  where halfExp = exp/2
// Equal jitter (vs full jitter) keeps a guaranteed floor of halfExp so a 429
// retry never fires instantly against an upstream that's actively rate-limiting,
// while still preventing thundering herd when multiple workers retry in sync.
function backoffWithJitter(attempt: number, baseDelay: number, maxDelay: number): number {
  const exp = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const halfExp = Math.floor(exp / 2);
  return halfExp + Math.floor(Math.random() * halfExp);
}

export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options?: FetchOptions
): Promise<Response> {
  const opts = { ...DEFAULT, ...options };

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    await waitForRateLimit(opts.rateLimit);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), opts.timeout);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });

      if (response.status === 429 && attempt < opts.maxRetries) {
        // Retry-After may be delta-seconds OR an HTTP-date (RFC 9110).
        // parseInt of a date yields NaN → setTimeout(NaN) fires instantly,
        // hammering an API that is actively rate-limiting us.
        const retryAfter = response.headers.get("Retry-After");
        let delay = backoffWithJitter(attempt, opts.baseDelay, opts.maxDelay);
        if (retryAfter) {
          const secs = Number(retryAfter);
          if (Number.isFinite(secs) && secs >= 0) {
            delay = Math.min(secs * 1000, opts.maxDelay);
          } else {
            const dateMs = Date.parse(retryAfter) - Date.now();
            if (Number.isFinite(dateMs) && dateMs > 0) delay = Math.min(dateMs, opts.maxDelay);
          }
        }
        // Drain the unconsumed body so undici can reuse the connection.
        await response.body?.cancel().catch(() => {});
        console.log(`  Rate limited, retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      if (response.status >= 500 && attempt < opts.maxRetries) {
        await response.body?.cancel().catch(() => {});
        const delay = backoffWithJitter(attempt, opts.baseDelay, opts.maxDelay);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      return response;
    } catch (err) {
      if (attempt === opts.maxRetries) throw err;
      const delay = backoffWithJitter(attempt, opts.baseDelay, opts.maxDelay);
      await new Promise((r) => setTimeout(r, delay));
    } finally {
      // Always clear the abort timer — on the network-error path it would
      // otherwise leak, keep the event loop alive (CLI won't exit), and fire
      // late against an already-settled controller.
      clearTimeout(timeoutId);
    }
  }

  throw new Error(`All ${opts.maxRetries + 1} attempts failed for ${url}`);
}
