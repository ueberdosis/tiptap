import { createSearchRegex, type SearchRegex } from './regex.js'
import type { SearchOptions } from './types.js'
import { unicodeWordCharacter } from './unicode-word-character.js'

export interface SearchMatcher {
  regex: SearchRegex
  // Group 0 is the full match. Whole-word RE2 reports group 1 without
  // neighboring non-word characters.
  resultGroup: number
}

function toSearchMatcher(regex: SearchRegex | null, resultGroup: number): SearchMatcher | null {
  return regex ? { regex, resultGroup } : null
}

function createWholeWordRegexMatcher(term: string, options: SearchOptions): SearchMatcher | null {
  const nonWordCharacter = `[^${unicodeWordCharacter}]`
  const source = `(?:^|${nonWordCharacter})(${term})(?:$|${nonWordCharacter})`
  const regex = createSearchRegex(source, { ...options, wholeWord: false })

  return toSearchMatcher(regex, 1)
}

/**
 * Creates the internal matcher used to discover search results.
 * RE2 lacks lookarounds, so whole-word regexes include neighboring non-word characters.
 * Group 1 reports only the user pattern, such as `cat` instead of the spaces around " cat ".
 * This wrapper lets RE2 retry alternatives and quantifiers until both boundaries match.
 */
export function createSearchMatcher(term: string, options: SearchOptions): SearchMatcher | null {
  if (!term) {
    return null
  }

  if (options.useRegex && options.wholeWord) {
    return createWholeWordRegexMatcher(term, options)
  }

  return toSearchMatcher(createSearchRegex(term, options), 0)
}
