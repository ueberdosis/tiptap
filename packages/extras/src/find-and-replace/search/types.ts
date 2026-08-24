import type { Node } from '@tiptap/editor/pm/model'

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
