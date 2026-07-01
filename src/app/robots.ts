import type { MetadataRoute } from 'next'
import { SITE_URL, absoluteUrl } from '@/lib/site'

/**
 * robots.txt — tuned for MAXIMUM AI + search visibility (July 2026 vendor docs).
 *
 * A bare `*: allow /` already permits every bot, but we list the agents explicitly so the file
 * documents intent and gives per-bot toggle points.
 *
 * RETRIEVAL/CITATION bots (the ones that get you cited) are always allowed: OAI-SearchBot,
 * ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Googlebot, Bingbot, Applebot,
 * Amazonbot, DuckAssistBot, Bravebot, YandexBot.
 *
 * TRAINING-primarily bots are also allowed because this is a PERSONAL BRAND that WANTS reach —
 * being in model weights bakes in "who Ali Ahmed is". To opt OUT of training later, flip the
 * TRAINING_BOTS block to `disallow: '/'` — it does NOT affect search or AI citations.
 *
 * Note: Google AI Overviews / AI Mode ride on Googlebot (Google-Extended only controls Gemini
 * training, NOT AIO). Bing access powers Copilot + ChatGPT-search fallback + DuckDuckGo.
 */

const TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      // Explicit allow for training crawlers (toggle to disallow: '/' to opt out of training).
      { userAgent: TRAINING_BOTS, allow: '/' },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    // `Host` expects a bare hostname (no scheme/slash); it's Yandex-only/deprecated but harmless.
    host: new URL(SITE_URL).host,
  }
}
