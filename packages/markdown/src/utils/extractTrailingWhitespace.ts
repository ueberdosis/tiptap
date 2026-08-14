/**
 * Split trailing whitespace off a string so marks can close without a stray space.
 * @param text The text to trim.
 * @returns The trimmed text and the whitespace that was removed.
 */
export function extractTrailingWhitespace(text: string): { text: string; whitespace: string } {
  const match = text.match(/(\s+)$/)

  if (!match) {
    return { text, whitespace: '' }
  }

  return { text: text.slice(0, -match[1].length), whitespace: match[1] }
}
