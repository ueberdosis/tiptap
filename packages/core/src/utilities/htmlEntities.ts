const NAMED_ENTITIES: Record<string, string> = { lt: '<', gt: '>', quot: '"', amp: '&' }

/**
 * Decode common HTML entities in text content so they display as literal
 * characters inside the editor. Runs as a single pass so a decoded entity
 * (e.g. `&#38;` → `&`) is never re-scanned and decoded again.
 */
export function decodeHtmlEntities(text: string): string {
  return text.replace(
    /&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|(lt|gt|quot|amp));/g,
    (match, dec, hex, name) => {
      if (dec !== undefined) {
        return decodeCodePoint(match, Number(dec))
      }
      if (hex !== undefined) {
        return decodeCodePoint(match, parseInt(hex, 16))
      }
      return NAMED_ENTITIES[name]
    },
  )
}

// Leave out-of-range numeric entities untouched instead of throwing.
function decodeCodePoint(match: string, codePoint: number): string {
  return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match
}

/**
 * Encode HTML special characters so they roundtrip safely through markdown.
 * `&` is encoded **first** to avoid double-encoding the ampersand in other
 * entities (e.g. `<` → `&lt;`, not `&amp;lt;`).
 *
 * Note: `"` is intentionally NOT encoded here because double quotes are
 * ordinary characters in markdown and do not need escaping.  The decode
 * function still handles `&quot;` because the markdown tokenizer may emit it.
 */
export function encodeHtmlEntities(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
