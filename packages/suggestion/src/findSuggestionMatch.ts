import { Range } from '@tiptap/core'
import { ResolvedPos } from 'prosemirror-model'

export interface Trigger {
  char: string,
  allowSpaces: boolean,
  prefixSpace: boolean,
  startOfLine: boolean,
  $position: ResolvedPos,
}

export type SuggestionMatch = {
  range: Range,
  query: string,
  text: string,
} | null

export function findSuggestionMatch(config: Trigger): SuggestionMatch {
  const {
    char,
    allowSpaces,
    prefixSpace,
    startOfLine,
    $position,
  } = config

  // Matching expressions used for later
  const escapedChar = char
    .split('')
    .map(c => `\\${c}`)
    .join('')
  const suffix = new RegExp(`\\s${escapedChar}$`)
  const prefix = startOfLine ? '^' : ''
  const regexp = allowSpaces
    ? new RegExp(`${prefix}${escapedChar}.*?(?=\\s${escapedChar}|$)`, 'gm')
    : new RegExp(`${prefix}(?:^)?${escapedChar}[^\\s${escapedChar}]*`, 'gm')

  const isTopLevelNode = $position.depth <= 0
  const textFrom = isTopLevelNode
    ? 0
    : $position.before()
  const textTo = $position.pos
  const text = $position.doc.textBetween(textFrom, textTo, '\0', '\0')
  const match = Array.from(text.matchAll(regexp)).pop()

  if (!match || match.input === undefined || match.index === undefined) {
    return null
  }

  // JavaScript doesn't have lookbehinds. This hacks a check that first character
  // is a space or the start of the line
  const matchPrefix = match.input.slice(Math.max(0, match.index - 1), match.index)
  const matchPrefixIsSpace = /^[\s\0]?$/.test(matchPrefix)

  if (prefixSpace && !matchPrefixIsSpace) {
    return null
  }

  // The absolute position of the match in the document
  const from = match.index + $position.start()
  let to = from + match[0].length

  // Edge case handling; if spaces are allowed and we're directly in between
  // two triggers
  if (allowSpaces && suffix.test(text.slice(to - 1, to + 1))) {
    match[0] += ' '
    to += 1
  }

  // If the $position is located within the matched substring, return that range
  if (from < $position.pos && to >= $position.pos) {
    return {
      range: {
        from,
        to,
      },
      query: match[0].slice(char.length),
      text: match[0],
    }
  }

  return null
}
