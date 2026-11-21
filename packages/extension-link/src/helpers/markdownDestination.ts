import { decodeHTMLStrict } from 'entities'

/**
 * Matches a character reference at the start of a string: named, decimal or hex.
 * CommonMark allows up to seven decimal digits and six hex digits.
 */
const CHARACTER_REFERENCE = /^&(?:#[0-9]{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]{1,31});/

/**
 * CommonMark only treats a backslash as an escape in front of ASCII punctuation.
 * A backslash before anything else is a literal backslash.
 */
function isAsciiPunctuation(character: string): boolean {
  return character >= '!' && character <= '~' && !/[A-Za-z0-9]/.test(character)
}

/**
 * Decodes the destination part of a Markdown link, as written in the source.
 *
 * The order matters: a backslash escape is resolved first, so `\&amp;` keeps
 * its literal `&amp;` instead of being decoded twice. Character references are
 * then decoded one level with the full HTML5 set.
 *
 * @param source - The destination exactly as it appears in the Markdown source
 * @returns The destination an editor should store
 */
export function decodeMarkdownDestination(source: string): string {
  let result = ''
  let index = 0

  while (index < source.length) {
    const character = source[index]

    if (character === '\\' && isAsciiPunctuation(source[index + 1] ?? '')) {
      result += source[index + 1]
      index += 2
      continue
    }

    if (character === '&') {
      const reference = CHARACTER_REFERENCE.exec(source.slice(index))?.[0]

      if (reference) {
        const decoded = decodeHTMLStrict(reference)

        if (decoded !== reference) {
          result += decoded
          index += reference.length
          continue
        }
      }
    }

    result += character
    index += 1
  }

  return result
}

/**
 * Reads the destination out of the raw source of an inline Markdown link, such
 * as `[text](https://example.com)` or `[text](<https://example.com/a b>)`.
 *
 * `marked` unescapes backslashes before it hands over `token.href`, which makes
 * `\&amp;` indistinguishable from `&amp;`. Going back to the raw source keeps
 * the two apart.
 *
 * @param raw - The full Markdown source of the link token
 * @returns The destination source, or `null` for reference links and anything
 * that is not an inline link
 */
export function extractMarkdownDestination(raw: string): string | null {
  let index = 0
  let depth = 0

  if (raw[index] !== '[') {
    return null
  }

  while (index < raw.length) {
    const character = raw[index]

    if (character === '\\') {
      index += 2
      continue
    }

    if (character === '[') {
      depth += 1
    } else if (character === ']') {
      depth -= 1

      if (depth === 0) {
        index += 1
        break
      }
    }

    index += 1
  }

  if (depth !== 0) {
    return null
  }

  while (raw[index] === ' ' || raw[index] === '\t' || raw[index] === '\n') {
    index += 1
  }

  if (raw[index] !== '(') {
    return null
  }

  index += 1

  while (raw[index] === ' ' || raw[index] === '\t' || raw[index] === '\n') {
    index += 1
  }

  if (raw[index] === '<') {
    index += 1
    const start = index

    while (index < raw.length) {
      const character = raw[index]

      if (character === '\\') {
        index += 2
        continue
      }

      if (character === '>') {
        return raw.slice(start, index)
      }

      if (character === '\n') {
        return null
      }

      index += 1
    }

    return null
  }

  const start = index
  let parentheses = 0

  while (index < raw.length) {
    const character = raw[index]

    if (character === '\\') {
      index += 2
      continue
    }

    if (character === '(') {
      parentheses += 1
    } else if (character === ')') {
      if (parentheses === 0) {
        break
      }

      parentheses -= 1
    } else if (/\s/.test(character)) {
      break
    }

    index += 1
  }

  if (parentheses !== 0) {
    return null
  }

  return raw.slice(start, index)
}
