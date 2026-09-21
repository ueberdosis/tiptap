import type { Node as PMNode } from '@tiptap/pm/model'

export interface SearchResult {
  from: number
  to: number
}

export interface TextblockSearchTarget {
  node: PMNode
  pos: number
}

export interface SearchOptions {
  caseSensitive: boolean
  useRegex: boolean
  wholeWord: boolean
}
