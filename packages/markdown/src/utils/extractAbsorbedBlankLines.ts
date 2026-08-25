import type { MarkdownToken } from '@tiptap/core'

/**
 * Matches a run of blank lines at the end of a string.
 * @example
 * TRAILING_BLANK_LINES.test('paragraph\n  \n')
 * // => true
 */
const TRAILING_BLANK_LINES = /\n[^\S\n]*(?:\n[^\S\n]*)+$/

/**
 * Recover blank lines absorbed into token `raw` as explicit `space` tokens.
 * @param tokens The marked token stream to normalize.
 * @returns A new token array with absorbed blank lines as `space` tokens.
 */
export function extractAbsorbedBlankLines(tokens: MarkdownToken[]): MarkdownToken[] {
  return tokens.flatMap((token, index) =>
    extractAbsorbedBlankLinesFromToken(token, tokens[index + 1]),
  )
}

/**
 * Recover blank lines absorbed into a single token's raw source as space tokens.
 */
function extractAbsorbedBlankLinesFromToken(
  token: MarkdownToken,
  nextToken: MarkdownToken | undefined,
): MarkdownToken[] {
  // A following `space` token already carries the blank lines for this gap.
  if (token.type === 'space' || nextToken?.type === 'space') {
    return [token]
  }

  const trailingBlankLines = (token.raw || '').match(TRAILING_BLANK_LINES)

  if (!trailingBlankLines) {
    return [token]
  }

  return [
    { ...token, raw: (token.raw || '').slice(0, -trailingBlankLines[0].length) },
    { type: 'space', raw: trailingBlankLines[0] } as MarkdownToken,
  ]
}
