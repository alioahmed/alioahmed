import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: SITE_CONFIG.defaultTitle,
    short_name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0b0c0f',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
