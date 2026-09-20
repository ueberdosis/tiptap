/**
 * Decode common HTML entities in text content so they display as literal
 * characters inside the editor.  The decode order matters: `&amp;` must be
 * decoded **last** so that doubly-encoded sequences like `&amp;lt;` first
 * survive the `&lt;` pass and then correctly become `&lt;` (not `<`).
 */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (match, dec) => decodeCodePoint(match, Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (match, hex) => decodeCodePoint(match, parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
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
