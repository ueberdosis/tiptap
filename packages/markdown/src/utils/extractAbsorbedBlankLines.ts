import type { MarkdownToken } from '@tiptap/core'

/**
 * Matches a run of two or more consecutive line breaks (a blank line) at the
 * end of a string, allowing horizontal whitespace between the breaks.
 *
 * @example
 * TRAILING_BLANK_LINES.test('paragraph\n  \n')
 * // => true
 */
const TRAILING_BLANK_LINES = /\n[^\S\n]*(?:\n[^\S\n]*)+$/

/**
 * Extracts blank lines absorbed into marked token `raw` back into explicit
 * `space` tokens so they're handled uniformly by the reconstruction path.
 * @param tokens The marked token stream to normalize.
 * @returns A new token array with absorbed blank lines as `space` tokens.
 */
export function extractAbsorbedBlankLines(tokens: MarkdownToken[]): MarkdownToken[] {
  return tokens.flatMap((token, index) =>
    extractAbsorbedBlankLinesFromToken(token, tokens[index + 1]),
  )
}

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
