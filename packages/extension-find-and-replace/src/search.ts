import type { Node } from '@tiptap/pm/model'
import { RE2JS } from 're2js'

export interface SearchResult {
  from: number
  to: number
}

export interface TextblockSearchTarget {
  node: Node
  pos: number
}

export interface SearchOptions {
  caseSensitive: boolean
  useRegex: boolean
  wholeWord: boolean
}

interface TextSegment {
  isText: boolean
  pos: number
  length: number
  text: string
  textOffset: number
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
  let textOffset = 0

  textblock.forEach((child, offset) => {
    const text = child.isText ? (child.text ?? '') : '\n'

    segments.push({
      isText: child.isText,
      pos: pos + 1 + offset,
      length: child.nodeSize,
      text,
      textOffset,
    })
    textOffset += text.length
  })

  return segments
}

function findOffsetSegment(segments: TextSegment[], offset: number): TextSegment | undefined {
  let low = 0
  let high = segments.length

  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    const segment = segments[middle]
    const segmentEnd = segment.textOffset + segment.text.length

    if (offset < segmentEnd) {
      high = middle
    } else {
      low = middle + 1
    }
  }

  return segments[low] ?? segments.at(-1)
}

function offsetToPos(segments: TextSegment[], offset: number): number {
  const segment = findOffsetSegment(segments, offset)

  return segment ? segment.pos + Math.min(offset - segment.textOffset, segment.length) : 0
}

function overlapsNonTextSegment(segments: TextSegment[], from: number, to: number): boolean {
  return segments.some(
    segment =>
      !segment.isText && from < segment.textOffset + segment.text.length && to > segment.textOffset,
  )
}

function searchTextblock(regex: SearchRegex, textblock: Node, pos: number): SearchResult[] {
  const segments = getTextSegments(textblock, pos)
  const text = segments.map(segment => segment.text).join('')
  const results: SearchResult[] = []

  for (const match of findMatches(regex, text)) {
    if (match.value.length === 0) {
      continue
    }

    const matchEnd = match.index + match.value.length

    if (overlapsNonTextSegment(segments, match.index, matchEnd)) {
      continue
    }

    results.push({
      from: offsetToPos(segments, match.index),
      to: offsetToPos(segments, matchEnd),
    })
  }

  return results
}

/**
 * Searches textblocks for a term and returns their matched ranges.
 * @param textblocks The textblocks and their document positions.
 * @param term The search term, treated as regex source when `useRegex` is enabled.
 * @param options Case sensitivity, regex mode, and whole word matching.
 * @returns The list of matched ranges in textblock order.
 */
export function searchTextblocks(
  textblocks: readonly TextblockSearchTarget[],
  term: string,
  options: SearchOptions,
): SearchResult[] {
  const regex = createSearchRegex(term, options)

  if (!regex) {
    return []
  }

  return textblocks.flatMap(({ node, pos }) => searchTextblock(regex, node, pos))
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
  const textblocks: TextblockSearchTarget[] = []

  doc.descendants((node, pos) => {
    if (!node.isTextblock) {
      return true
    }

    textblocks.push({ node, pos })

    return false
  })

  return searchTextblocks(textblocks, term, options)
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
