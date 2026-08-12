import type { Node } from '@tiptap/pm/model'

import { createSearchRegex } from './regex.js'
import { searchTextblock } from './textblock-search.js'
import type { SearchOptions, SearchResult, TextblockSearchTarget } from './types.js'

export type { SearchOptions, SearchResult, TextblockSearchTarget } from './types.js'
export { createSearchRegex } from './regex.js'

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
