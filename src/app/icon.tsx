import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

/** App icon — "AA" monogram on ink. Single source for favicon + PWA icon. */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d253d',
        color: '#ffffff',
        fontSize: 280,
        fontWeight: 700,
        letterSpacing: '-0.04em',
        fontFamily: 'sans-serif',
      }}
    >
      AA
    </div>,
    { ...size },
  )
}
