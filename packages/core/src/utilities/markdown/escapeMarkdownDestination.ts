/**
 * Escapes a URL so it can be written as an inline Markdown link destination.
 *
 * A destination is delimited by parentheses and cannot contain unescaped
 * whitespace, so an `href` like `https://example.com/a(b)c` would otherwise end
 * the link early or be cut in half when the Markdown is read back. Everything
 * that is not allowed verbatim is written as a character reference, which
 * CommonMark decodes again on parse:
 *
 * - `&` becomes `&amp;`, so a destination that literally contains `&amp;`
 *   survives a round trip instead of being decoded a second time
 * - `(`, `)`, `<`, `>` and `\` become character references, as does whitespace
 *
 * @param destination - The link destination, such as a URL
 * @returns The escaped destination, ready to be placed between the parentheses
 *
 * @example
 * ```ts
 * escapeMarkdownDestination('https://example.com/a(b)c')
 * // 'https://example.com/a&#40;b&#41;c'
 * ```
 */
export function escapeMarkdownDestination(destination: string): string {
  return destination.replace(/[&()<>\\\s\u007f]/g, character => {
    switch (character) {
      case '&':
        return '&amp;'
      case '(':
        return '&#40;'
      case ')':
        return '&#41;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '\\':
        return '\\\\'
      default:
        return `&#${character.charCodeAt(0)};`
    }
  })
}
