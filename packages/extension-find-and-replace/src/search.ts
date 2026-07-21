import type { Node } from '@tiptap/pm/model'

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

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Heuristic only; reject common catastrophic-backtracking patterns.
const isUnsafeRegex = (pattern: string): boolean => {
  // Nested quantifiers: (a+)+, (a*)+, (a+)*, etc.
  if (/\([^)]*[+*][^)]*\)[+*]/.test(pattern)) {
    return true
  }

  // Overlapping alternations with quantifiers: (a|a)+, (a|a)*
  if (/\(([^|]+)\|(\1)\)[+*]/.test(pattern)) {
    return true
  }

  // Quantified groups with overlapping patterns: (a.*a)+
  if (/\([^)]*\.[^)]*\)[+*]/.test(pattern)) {
    return true
  }

  return false
}

function compileRegex(source: string, caseSensitive: boolean): RegExp | null {
  if (isUnsafeRegex(source)) {
    return null
  }

  try {
    return new RegExp(source, caseSensitive ? 'g' : 'gi')
  } catch {
    return null
  }
}

export function createSearchRegex(term: string, options: SearchOptions): RegExp | null {
  if (!term) {
    return null
  }

  let source: string

  if (options.useRegex) {
    source = term
  } else {
    const escaped = escapeRegExp(term)
    source = options.wholeWord ? `\\b${escaped}\\b` : escaped
  }

  return compileRegex(source, options.caseSensitive)
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

    for (const match of text.matchAll(regex)) {
      if (match[0].length === 0) {
        continue
      }

      results.push({
        from: offsetToPos(segments, match.index),
        to: offsetToPos(segments, match.index + match[0].length),
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
