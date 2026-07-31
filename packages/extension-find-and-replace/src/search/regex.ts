import { RE2JS } from 're2js'

import type { SearchOptions } from './types.js'
import { unicodeWordCharacter } from './unicode-word-character.js'

export type SearchRegex = RegExp | RE2JS

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function compileNativeRegex(source: string, caseSensitive: boolean): RegExp | null {
  try {
    return new RegExp(source, caseSensitive ? 'gu' : 'giu')
  } catch {
    return null
  }
}

function compileSafeRegex(source: string, caseSensitive: boolean): RE2JS | null {
  try {
    const flags = caseSensitive ? 0 : RE2JS.CASE_INSENSITIVE

    return RE2JS.compile(source, flags)
  } catch {
    return null
  }
}

function compileRegex(
  source: string,
  options: Pick<SearchOptions, 'caseSensitive' | 'useRegex'>,
): SearchRegex | null {
  return options.useRegex
    ? compileSafeRegex(source, options.caseSensitive)
    : compileNativeRegex(source, options.caseSensitive)
}

/**
 * Creates a search matcher for a term.
 * Regex mode uses RE2-compatible syntax to avoid catastrophic backtracking.
 * In regex mode, whole-word constraints are applied by `searchDocument` and
 * `searchTextblocks`; this low-level factory preserves the user pattern's capture numbering.
 * @param term The search term, treated as regex source when `useRegex` is enabled.
 * @param options Case sensitivity, regex mode, and literal whole-word matching.
 * @returns A compiled matcher, or `null` when the term is invalid or unsupported.
 */
export function createSearchRegex(term: string, options: SearchOptions): SearchRegex | null {
  if (!term) {
    return null
  }

  let source: string

  if (options.useRegex) {
    source = term
  } else {
    const escaped = escapeRegExp(term)

    // Whole-word searches reject terms next to another Unicode word character.
    const wordCharacter = `[${unicodeWordCharacter}]`
    source = options.wholeWord ? `(?<!${wordCharacter})${escaped}(?!${wordCharacter})` : escaped
  }

  return compileRegex(source, options)
}
