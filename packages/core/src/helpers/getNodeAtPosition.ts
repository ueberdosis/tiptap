import type { Node as PMNode, NodeType } from '@tiptap/pm/model'
import type { EditorState } from '@tiptap/pm/state'

/**
 * Finds the first node of a given type or name in the current selection.
 * @param state The editor state.
 * @param typeOrName The node type or name.
 * @param pos The position to start searching from.
 * @param maxDepth The maximum depth to search.
 * @returns The node and the depth as an array.
 */
export const getNodeAtPosition = (
  state: EditorState,
  typeOrName: string | NodeType,
  pos: number,
  maxDepth = 20,
) => {
  const $pos = state.doc.resolve(pos)

  let currentDepth = maxDepth
  let node: PMNode | null = null

  while (currentDepth > 0 && node === null) {
    const currentNode = $pos.node(currentDepth)

    if (currentNode?.type.name === typeOrName) {
      node = currentNode
    } else {
      currentDepth -= 1
    }
  }

  return [node, currentDepth] as [PMNode | null, number]
}
