import type { NodeType } from '@tiptap/pm/model'
import { type EditorState, NodeSelection } from '@tiptap/pm/state'

export function canInsertNode(state: EditorState, nodeType: NodeType): boolean {
  const { selection } = state
  const { $from } = selection

  // Special handling for NodeSelection
  if (selection instanceof NodeSelection) {
    const index = $from.index()
    const parent = $from.parent

    // Can we replace the selected node with the horizontal rule?
    return parent.canReplaceWith(index, index + 1, nodeType)
  }

  // Default: check if we can insert at the current position
  let depth = $from.depth

  while (depth >= 0) {
    const index = $from.index(depth)
    const parent = $from.node(depth)
    const match = parent.contentMatchAt(index)

    if (match.matchType(nodeType)) {
      return true
    }
    depth -= 1
  }
  return false
}
