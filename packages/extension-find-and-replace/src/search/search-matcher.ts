import { createSearchRegex, type SearchRegex } from './regex.js'
import type { SearchOptions } from './types.js'
import { unicodeWordCharacter } from './unicode-word-character.js'

export interface SearchMatcher {
  regex: SearchRegex
  // Group 0 is the full match. Group 1 is just the word itself.
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

/** Creates a matcher for finding search results, with special handling for whole-word searches. */
export function createSearchMatcher(term: string, options: SearchOptions): SearchMatcher | null {
  if (!term) {
    return null
  }

  if (options.useRegex && options.wholeWord) {
    return createWholeWordRegexMatcher(term, options)
  }

  return toSearchMatcher(createSearchRegex(term, options), 0)
}
