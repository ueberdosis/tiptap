import type { Token } from 'marked'

// Bare URLs and emails lex as links whose raw text equals the link text
function isBareAutolink(inline: Token): boolean {
  return inline.type === 'link' && inline.raw === inline.text
}

/**
 * Returns true when the lexed text has markdown syntax: any block other than a paragraph,
 * or a paragraph with inline tokens other than plain text. Bare autolinks (a plain URL,
 * `www.` URL or email address) count as plain text.
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

    return token.tokens?.some(inline => inline.type !== 'text' && !isBareAutolink(inline)) ?? false
  })
}
