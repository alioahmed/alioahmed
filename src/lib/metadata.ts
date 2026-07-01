/**
 * createMetadata — the single helper every page uses to produce a complete, consistent
 * Next.js Metadata object: canonical, OpenGraph, Twitter card, and the robots block.
 */

import type { Metadata } from 'next'
import { SITE_CONFIG, absoluteUrl } from '@/lib/site'

const DEFAULT_OG = '/opengraph-image'

export interface CreateMetadataOptions {
  title?: string
  description?: string
  /** Site-relative path, e.g. "/about". Defaults to "/". */
  path?: string
  /** Site-relative OG image path. Defaults to the generated /opengraph-image. */
  ogImage?: string
  /** When true, emits noindex/nofollow. */
  noIndex?: boolean
}

export function createMetadata(options: CreateMetadataOptions = {}): Metadata {
  const { title, description = SITE_CONFIG.description, path = '/', noIndex = false } = options

  const canonical = absoluteUrl(path)
  const ogImage = absoluteUrl(options.ogImage ?? DEFAULT_OG)
  const resolvedTitle = title ?? SITE_CONFIG.defaultTitle

  return {
    title: resolvedTitle,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title: resolvedTitle,
      description,
      siteName: SITE_CONFIG.name,
      locale: 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_CONFIG.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description,
      images: [ogImage],
      creator: SITE_CONFIG.twitterHandle,
      site: SITE_CONFIG.twitterHandle,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  }
}
