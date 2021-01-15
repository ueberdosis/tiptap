import { ResolvedPos } from 'prosemirror-model'

export interface Trigger {
  char: string,
  allowSpaces: boolean,
  startOfLine: boolean,
  $position: ResolvedPos,
}

export type SuggestionMatch = {
  range: {
    from: number,
    to: number,
  },
  query: string,
  text: string,
} | null

export function findSuggestionMatch(config: Trigger): SuggestionMatch {
  const {
    char, allowSpaces, startOfLine, $position,
  } = config

  // cancel if top level node
  if ($position.depth <= 0) {
    return null
  }

  // Matching expressions used for later
  const escapedChar = `\\${char}`
  const suffix = new RegExp(`\\s${escapedChar}$`)
  const prefix = startOfLine ? '^' : ''
  const regexp = allowSpaces
    ? new RegExp(`${prefix}${escapedChar}.*?(?=\\s${escapedChar}|$)`, 'gm')
    : new RegExp(`${prefix}(?:^)?${escapedChar}[^\\s${escapedChar}]*`, 'gm')

  // Lookup the boundaries of the current node
  const textFrom = $position.before()

  // Only look up to the cursor, old behavior: textTo = $position.end()
  const textTo = $position.pos

  const text = $position.doc.textBetween(textFrom, textTo, '\0', '\0')

  let match = regexp.exec(text)
  let position = null

  while (match !== null) {
    // JavaScript doesn't have lookbehinds; this hacks a check that first character is " "
    // or the line beginning
    const matchPrefix = match.input.slice(Math.max(0, match.index - 1), match.index)

    if (/^[\s\0]?$/.test(matchPrefix)) {
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
        position = {
          range: {
            from,
            to,
          },
          query: match[0].slice(char.length),
          text: match[0],
        }
      }
    }

    match = regexp.exec(text)
  }

  return position
}
