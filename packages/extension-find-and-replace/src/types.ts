import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

import type { SearchResult } from './search/search.js'

export interface FindAndReplaceOptions {
  /**
   * The initial search term.
   * @default ''
   */
  searchTerm: string

  /**
   * The initial replace term.
   * @default ''
   */
  replaceTerm: string

  /**
   * Whether the search is case sensitive.
   * @default false
   */
  caseSensitive: boolean

  /**
   * Whether the search term is treated as an RE2-compatible regular expression.
   * Lookarounds and backreferences are not supported.
   * @default false
   */
  useRegex: boolean

  /**
   * Whether to match whole words only. Ignored when `useRegex` is enabled.
   * @default false
   */
  wholeWord: boolean

  /**
   * Whether a textblock continues the textblock before it.
   * Continued textblocks are searched as one text, so a match can start in one and end in the next.
   * @param node The textblock to check.
   * @returns `true` when the node continues the previous textblock.
   * @default () => false
   * @example
   * FindAndReplace.configure({
   *   continuesNode: node => node.attrs.continued === true,
   * })
   */
  continuesNode: (node: ProseMirrorNode) => boolean

  /**
   * Debounce delay in milliseconds applied to `setSearchTerm`.
   * Set to `0` to disable debouncing.
   * @default 250
   */
  searchDebounceMs: number

  /**
   * Whether the default result highlight styles are injected.
   * @default true
   */
  injectCSS: boolean

  /**
   * A nonce for the injected style tag, needed for strict CSP setups.
   * @default undefined
   */
  injectNonce: string | undefined
}

export interface FindAndReplaceStorage {
  /**
   * The current search term.
   */
  searchTerm: string

  /**
   * The current replace term.
   */
  replaceTerm: string

  /**
   * Whether the search is case sensitive.
   */
  caseSensitive: boolean

  /**
   * Whether the search term is treated as an RE2-compatible regular expression.
   */
  useRegex: boolean

  /**
   * Whether to match whole words only. Ignored when `useRegex` is enabled.
   */
  wholeWord: boolean

  /**
   * The current search results in document order.
   */
  results: SearchResult[]

  /**
   * The index of the current result, or `null` when no result is selected.
   */
  currentIndex: number | null
}

declare module '@tiptap/core' {
  interface Storage {
    findAndReplace: FindAndReplaceStorage
  }
}
