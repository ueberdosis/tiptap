import { findParentNode } from '@tiptap/core'
import type { EditorState } from '@tiptap/pm/state'

export const isInsideSummary = (typeOrName: string, state: EditorState) => {
  const summaryData = findParentNode(currentNode => currentNode.type.name === typeOrName)(state.selection)

  if (!summaryData) {
    return false
  }

  return summaryData.node.type.name === typeOrName
}
