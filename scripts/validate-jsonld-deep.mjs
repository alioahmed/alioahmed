#!/usr/bin/env node
/**
 * validate-jsonld-deep.mjs — richer, rich-results-oriented checks layered on top of the
 * structural validator. Run the dev/preview server first.
 *
 * Usage: node scripts/validate-jsonld-deep.mjs [baseUrl]   (default http://localhost:3000)
 */

const BASE = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '')
const ROUTES = ['/']

let errors = 0
let warnings = 0
const err = (m) => {
  errors++
  console.error(`  ✗ ${m}`)
}
const warn = (m) => {
  warnings++
  console.warn(`  ! ${m}`)
}

function extractBlocks(html) {
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  const out = []
  let m
  while ((m = re.exec(html)) !== null) out.push(m[1])
  return out
}

function nodesOf(json) {
  if (json['@graph']) return json['@graph']
  return Array.isArray(json) ? json : [json]
}

function checkPerson(p) {
  if (!p.sameAs || (Array.isArray(p.sameAs) && p.sameAs.length === 0))
    warn('Person has no sameAs — entity consolidation will be weak')
  if (!p.image) warn('Person has no image (headshot strengthens entity match)')
  if (!p.jobTitle) warn('Person has no jobTitle')
  if (!p.worksFor) warn('Person has no worksFor')
}

function checkOrg(o) {
  if (!o.url) warn(`Organization "${o.name ?? '?'}" has no url`)
}

function checkBreadcrumb(b) {
  const items = b.itemListElement ?? []
  items.forEach((it, i) => {
    if (it.position !== i + 1) err(`BreadcrumbList position out of order at index ${i}`)
    if (!it.name) err('BreadcrumbList item missing name')
  })
}

function checkFAQ(f) {
  for (const q of f.mainEntity ?? []) {
    if (!q.name) err('FAQ Question missing name')
    const ans = q.acceptedAnswer?.text ?? ''
    if (ans.length < 30) warn('FAQ answer shorter than 30 chars')
  }
}

async function main() {
  console.log(`Deep-validating JSON-LD against ${BASE}\n`)
  for (const route of ROUTES) {
    console.log(`• ${route}`)
    let html
    try {
      const res = await fetch(`${BASE}${route}`)
      if (!res.ok) {
        err(`fetch → ${res.status}`)
        continue
      }
      html = await res.text()
    } catch (e) {
      err(`fetch failed: ${e.message}`)
      continue
    }

    for (const raw of extractBlocks(html)) {
      let json
      try {
        json = JSON.parse(raw)
      } catch {
        continue
      }
      for (const node of nodesOf(json)) {
        const t = node['@type']
        if (t === 'Person') checkPerson(node)
        else if (t === 'Organization') checkOrg(node)
        else if (t === 'BreadcrumbList') checkBreadcrumb(node)
        else if (t === 'FAQPage') checkFAQ(node)
      }
    }
    console.log('')
  }
  console.log(`Done — ${errors} error(s), ${warnings} warning(s).`)
  process.exit(errors > 0 ? 1 : 0)
}

main()
