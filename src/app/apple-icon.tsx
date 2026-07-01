import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** Apple touch icon — "AA" monogram, padded for iOS rounded-rect masking. */
export default function AppleIcon() {
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
        fontSize: 96,
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
