/**
 * Split leading whitespace off a string so marks can open without a stray space.
 * @param text The text to trim.
 * @returns The trimmed text and the whitespace that was removed.
 */
export function extractLeadingWhitespace(text: string): { text: string; whitespace: string } {
  const match = text.match(/^(\s+)/)

  if (!match) {
    return { text, whitespace: '' }
  }

  return { text: text.slice(match[1].length), whitespace: match[1] }
}
