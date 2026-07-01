import type { SchemaNode } from '@/lib/schema'

/**
 * Escape a JSON-LD payload for safe inline embedding. JSON.stringify does NOT escape `<`, `>`,
 * `&`, or the JS line separators U+2028/U+2029 — a literal `</script>` (or such chars) in any
 * future content string would otherwise break out of the tag. Cheap, permanent hardening.
 */
function safeJsonLd(data: SchemaNode): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/**
 * Renders a JSON-LD <script> tag. Server component — the data is serialized at render time.
 * Usage: <JsonLd data={defaultGraph()} />
 */
export function JsonLd({ data }: { data: SchemaNode }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  )
}
