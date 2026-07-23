import type { EditorState } from '@tiptap/pm/state'

import type { SearchResult } from '../search/search.js'

export interface TextNodeResult {
  from: number
  text: string
}

export function getTextNodeResult(state: EditorState, result: SearchResult): TextNodeResult | null {
  const $from = state.doc.resolve(result.from)
  const node = $from.parent.child($from.index())

  if (!node.isText || !node.text) {
    return null
  }

  const from = result.from - $from.textOffset

  return result.to <= from + node.nodeSize ? { from, text: node.text } : null
}
