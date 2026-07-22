import type { Node } from '@tiptap/pm/model'
import { RE2JS } from 're2js'

export interface SearchResult {
  from: number
  to: number
}

export interface SearchOptions {
  caseSensitive: boolean
  useRegex: boolean
  wholeWord: boolean
}

interface TextSegment {
  pos: number
  length: number
  text: string
}

interface TextMatch {
  index: number
  value: string
}

type SearchRegex = RegExp | RE2JS

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Unicode word characters like letters, accents, numbers, and underscore-like punctuation. */
const unicodeWordCharacter = '[\\p{L}\\p{M}\\p{N}\\p{Pc}]'

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
 * @param term The search term, treated as regex source when `useRegex` is enabled.
 * @param options Case sensitivity, regex mode, and whole word matching.
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
    source = options.wholeWord
      ? `(?<!${unicodeWordCharacter})${escaped}(?!${unicodeWordCharacter})`
      : escaped
  }

  return compileRegex(source, options)
}

function* findNativeMatches(regex: RegExp, text: string): Generator<TextMatch> {
  for (const match of text.matchAll(regex)) {
    yield { index: match.index, value: match[0] }
  }
}

function* findSafeMatches(regex: RE2JS, text: string): Generator<TextMatch> {
  const matcher = regex.matcher(text)

  while (matcher.find()) {
    yield { index: matcher.start(), value: matcher.group() ?? '' }
  }
}

function findMatches(regex: SearchRegex, text: string): Generator<TextMatch> {
  return regex instanceof RegExp ? findNativeMatches(regex, text) : findSafeMatches(regex, text)
}

// Non-text inline nodes (hard break, mention, ...) contribute a placeholder
// so matches never silently span across them.
function getTextSegments(textblock: Node, pos: number): TextSegment[] {
  const segments: TextSegment[] = []

  textblock.forEach((child, offset) => {
    segments.push({
      pos: pos + 1 + offset,
      length: child.nodeSize,
      text: child.isText ? (child.text ?? '') : '\n',
    })
  })

  return segments
}

function offsetToPos(segments: TextSegment[], offset: number): number {
  let remaining = offset

  for (const segment of segments) {
    if (remaining < segment.text.length) {
      return segment.pos + Math.min(remaining, segment.length)
    }

    remaining -= segment.text.length
  }

  const last = segments[segments.length - 1]

  return last ? last.pos + last.length : 0
}

/**
 * Searches all textblocks of a document for a term and returns the matched ranges.
 * Matches may span multiple text nodes (e.g. across marks), but never leave a textblock.
 * @param doc The document to search in.
 * @param term The search term, treated as regex source when `useRegex` is enabled.
 * @param options Case sensitivity, regex mode, and whole word matching.
 * @returns The list of matched ranges in document order.
 */
export function searchDocument(doc: Node, term: string, options: SearchOptions): SearchResult[] {
  const regex = createSearchRegex(term, options)

  if (!regex) {
    return []
  }

  const results: SearchResult[] = []

  doc.descendants((node, pos) => {
    if (!node.isTextblock) {
      return true
    }

    const segments = getTextSegments(node, pos)
    const text = segments.map(segment => segment.text).join('')

    for (const match of findMatches(regex, text)) {
      if (match.value.length === 0) {
        continue
      }

      results.push({
        from: offsetToPos(segments, match.index),
        to: offsetToPos(segments, match.index + match.value.length),
      })
    }

    return false
  })

  return results
}

/**
 * Finds the index of the first result at or after a position, wrapping around
 * to the first result when the position is behind the last result.
 * @param results The current search results.
 * @param from The position to search from.
 * @returns The result index, or `null` when there are no results.
 */
export function findNextIndex(results: SearchResult[], from: number): number | null {
  if (results.length === 0) {
    return null
  }

  const index = results.findIndex(result => result.from >= from)

  return index === -1 ? 0 : index
}
