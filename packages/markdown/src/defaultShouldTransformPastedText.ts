import type { Token } from 'marked'

/**
 * Returns true when the lexed text has markdown syntax: any block other than a paragraph,
 * or a paragraph with inline tokens other than plain text.
 *
 * @param tokens The tokens from lexing the pasted text.
 * @returns Whether the text should be pasted as markdown.
 */
export function defaultShouldTransformPastedText(tokens: Token[]): boolean {
  return tokens.some(token => {
    if (token.type === 'space') {
      return false
    }

    if (token.type !== 'paragraph') {
      return true
    }

    return token.tokens?.some(inline => inline.type !== 'text') ?? false
  })
}
