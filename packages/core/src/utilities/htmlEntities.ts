const NAMED_ENTITIES: Record<string, string> = { lt: '<', gt: '>', quot: '"', amp: '&' }

/**
 * Decode common HTML entities in text content so they display as literal
 * characters inside the editor. Runs as a single pass so a decoded entity
 * (e.g. `&#38;` → `&`) is never re-scanned and decoded again.
 */
export function decodeHtmlEntities(text: string): string {
  // Digit limits per CommonMark: decimal refs are 1-7 digits, hex refs are 1-6.
  return text.replace(
    /&(?:#(\d{1,7})|#[xX]([0-9a-fA-F]{1,6})|(lt|gt|quot|amp));/g,
    (match, dec, hex, name) => {
      if (dec !== undefined) {
        return decodeCodePoint(Number(dec))
      }
      if (hex !== undefined) {
        return decodeCodePoint(parseInt(hex, 16))
      }
      return NAMED_ENTITIES[name]
    },
  )
}

// HTML5 maps numeric references in the C1 range (0x80-0x9F) to Windows-1252 characters.
const WINDOWS_1252 = new Map<number, number>([
  [0x80, 0x20ac],
  [0x82, 0x201a],
  [0x83, 0x0192],
  [0x84, 0x201e],
  [0x85, 0x2026],
  [0x86, 0x2020],
  [0x87, 0x2021],
  [0x88, 0x02c6],
  [0x89, 0x2030],
  [0x8a, 0x0160],
  [0x8b, 0x2039],
  [0x8c, 0x0152],
  [0x8e, 0x017d],
  [0x91, 0x2018],
  [0x92, 0x2019],
  [0x93, 0x201c],
  [0x94, 0x201d],
  [0x95, 0x2022],
  [0x96, 0x2013],
  [0x97, 0x2014],
  [0x98, 0x02dc],
  [0x99, 0x2122],
  [0x9a, 0x0161],
  [0x9b, 0x203a],
  [0x9c, 0x0153],
  [0x9e, 0x017e],
  [0x9f, 0x0178],
])

// Replace invalid code points with U+FFFD, per the CommonMark spec.
function decodeCodePoint(codePoint: number): string {
  if (codePoint === 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) {
    return '\uFFFD'
  }
  return String.fromCodePoint(WINDOWS_1252.get(codePoint) ?? codePoint)
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
