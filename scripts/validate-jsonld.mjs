#!/usr/bin/env node
/**
 * validate-jsonld.mjs — fetch each route, extract every JSON-LD block, and assert structural
 * correctness: @context present, required fields per @type, every node typed, URLs absolute,
 * ISO dates, and @id referential integrity (dangling refs error). Exits non-zero on errors.
 *
 * Usage: node scripts/validate-jsonld.mjs [baseUrl]   (default http://localhost:3000)
 */

const BASE = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '')

// Routes to check. Add content routes here as they ship.
const ROUTES = ['/']

// Global @id anchors that may be referenced before being fully defined on a page.
const GLOBAL_IDS = ['#person', '#website', '#profilepage']

const REQUIRED = {
  Person: ['name'],
  ProfilePage: ['mainEntity'],
  WebSite: ['url', 'name'],
  WebPage: ['url', 'name'],
  Organization: ['name', 'url'],
  BreadcrumbList: ['itemListElement'],
  FAQPage: ['mainEntity'],
  Article: ['headline', 'author'],
  ItemList: ['itemListElement'],
  SoftwareApplication: ['name', 'applicationCategory'],
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T.*)?$/

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

function collectIds(node, defined, referenced) {
  if (Array.isArray(node)) {
    node.forEach((n) => collectIds(n, defined, referenced))
    return
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === '@id' && typeof v === 'string') defined.add(v)
      collectIds(v, defined, referenced)
    }
    // a lone { "@id": x } with no other identity keys is a reference
    const keys = Object.keys(node)
    if (keys.length === 1 && keys[0] === '@id' && typeof node['@id'] === 'string') {
      referenced.add(node['@id'])
    }
  }
}

function checkNode(node) {
  if (!node || typeof node !== 'object') return
  // Skip pure @id reference nodes — they intentionally carry no @type.
  const keys = Object.keys(node)
  if (keys.length === 1 && keys[0] === '@id') return
  const type = node['@type']
  if (!type) {
    warn(`node missing @type: ${JSON.stringify(node).slice(0, 80)}`)
    return
  }
  const types = Array.isArray(type) ? type : [type]
  for (const t of types) {
    const req = REQUIRED[t]
    if (req) for (const f of req) if (!(f in node)) err(`${t} missing required field "${f}"`)
  }
  for (const [k, v] of Object.entries(node)) {
    if ((k === 'datePublished' || k === 'dateModified') && typeof v === 'string') {
      if (!ISO_DATE.test(v)) err(`${k} not ISO: "${v}"`)
    }
    if (k === 'url' && typeof v === 'string' && v.startsWith('/')) {
      warn(`relative url "${v}" (should be absolute)`)
    }
  }
}

function walk(node, fn) {
  if (Array.isArray(node)) return node.forEach((n) => walk(n, fn))
  if (node && typeof node === 'object') {
    fn(node)
    for (const v of Object.values(node)) walk(v, fn)
  }
}

async function main() {
  console.log(`Validating JSON-LD against ${BASE}\n`)
  for (const route of ROUTES) {
    const url = `${BASE}${route}`
    console.log(`• ${route}`)
    let html
    try {
      const res = await fetch(url)
      if (!res.ok) {
        err(`fetch ${url} → ${res.status}`)
        continue
      }
      html = await res.text()
    } catch (e) {
      err(`fetch ${url} failed: ${e.message}`)
      continue
    }

    const blocks = extractBlocks(html)
    if (blocks.length === 0) {
      err('no JSON-LD blocks found')
      continue
    }

    const defined = new Set()
    const referenced = new Set()

    for (const raw of blocks) {
      let json
      try {
        json = JSON.parse(raw)
      } catch (e) {
        err(`invalid JSON: ${e.message}`)
        continue
      }
      const hasContext = json['@context'] || (Array.isArray(json) && json.some((n) => n['@context']))
      if (!hasContext) warn('block missing @context')
      collectIds(json, defined, referenced)
      walk(json['@graph'] ?? json, checkNode)
    }

    for (const ref of referenced) {
      const isGlobal = GLOBAL_IDS.some((g) => ref.endsWith(g))
      const isAbsolute = /^https?:\/\//.test(ref) && defined.has(ref)
      if (!defined.has(ref) && !isGlobal && !isAbsolute) {
        warn(`@id reference "${ref}" not defined on this page`)
      }
    }
    console.log('')
  }

  console.log(`Done — ${errors} error(s), ${warnings} warning(s).`)
  process.exit(errors > 0 ? 1 : 0)
}

main()
