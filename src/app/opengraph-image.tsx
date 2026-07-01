import { ImageResponse } from 'next/og'
import { SITE_CONFIG } from '@/lib/site'

export const alt = SITE_CONFIG.defaultTitle
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Default Open Graph / Twitter card — generated at build time, so there is never a broken
 * /og/*.png reference. Per-page OG images can override this later via the metadata API.
 * Provisional design; final OG art is a content-phase task.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0b0c0f',
        color: '#ffffff',
        padding: '72px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 26,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#7c8cff',
          fontWeight: 600,
        }}
      >
        {SITE_CONFIG.title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: '-0.03em' }}>
          {SITE_CONFIG.name}
        </div>
        <div style={{ fontSize: 34, fontWeight: 400, color: '#b6bcc6', maxWidth: 940 }}>
          Builds what he sells — LLM/RAG products, AI agents & IoT platforms shipped to production.
        </div>
      </div>
      <div style={{ display: 'flex', fontSize: 26, color: '#7e8694', gap: 28 }}>
        <span>Cognilium AI</span>
        <span>·</span>
        <span>Bijli Bachao</span>
        <span>·</span>
        <span>{SITE_CONFIG.location.display}</span>
      </div>
    </div>,
    { ...size },
  )
}
