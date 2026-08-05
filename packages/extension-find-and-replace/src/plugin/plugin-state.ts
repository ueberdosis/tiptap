import type { DecorationSet } from '@tiptap/pm/view'

import type { SearchResult } from '../search/search.js'

/**
 * The results, the current index, and the decorations that highlight them.
 */
export interface FindAndReplacePluginState {
  searchTerm: string
  replaceTerm: string
  caseSensitive: boolean
  useRegex: boolean
  wholeWord: boolean
  results: SearchResult[]
  currentIndex: number | null
  decorations: DecorationSet
}

/**
 * Transaction meta to patch the plugin state. Setting `searchTerm`,
 * `caseSensitive`, `useRegex` or `wholeWord` re-runs the search.
 */
export interface FindAndReplaceMeta {
  searchTerm?: string
  replaceTerm?: string
  caseSensitive?: boolean
  useRegex?: boolean
  wholeWord?: boolean
  currentIndex?: number | null
}
