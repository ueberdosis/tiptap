import type { EditorState } from '@tiptap/pm/state'

import type { SearchResult } from '../search/search.js'

/**
 * A result together with the text node that holds it.
 */
export interface TextNodeResult {
  from: number
  text: string
}

/**
 * Find the text node a result sits in.
 * @returns `null` when the range is not inside a single text node.
 */
export function getTextNodeResult(state: EditorState, result: SearchResult): TextNodeResult | null {
  const $from = state.doc.resolve(result.from)
  const node = $from.parent.child($from.index())

  if (!node.isText || !node.text) {
    return null
  }

  const from = result.from - $from.textOffset

  return result.to <= from + node.nodeSize ? { from, text: node.text } : null
}
