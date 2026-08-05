import type { Node } from '@tiptap/pm/model'

/**
 * One match, as a range in the document.
 */
export interface SearchResult {
  from: number
  to: number
}

/**
 * A text block to search, with its position in the document.
 */
export interface TextblockSearchTarget {
  node: Node
  pos: number
}

/**
 * The settings that decide how the search term is matched.
 */
export interface SearchOptions {
  caseSensitive: boolean

  /**
   * Treat the search term as a regular expression.
   */
  useRegex: boolean

  /**
   * Match whole words only. Ignored when `useRegex` is on.
   */
  wholeWord: boolean
}
