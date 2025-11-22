import { PluginKey } from '@tiptap/pm/state'

export interface SearchResult {
  from: number
  to: number
}

export interface SearchAndReplaceOptions {
  searchResultClass: string
  searchResultCurrentClass: string
  disableBrowserSearch: boolean
  caseSensitive: boolean
  searchDebounce: number
}

export interface SearchAndReplaceStorage {
  searchTerm: string
  results: SearchResult[]
  resultIndex: number
  lastSearchTerm: string
  caseSensitive: boolean
}

export const searchAndReplacePluginKey = new PluginKey('searchAndReplace')

export default {
  searchAndReplacePluginKey,
}
