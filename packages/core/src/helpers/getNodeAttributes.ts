import type { Node, NodeType } from '@tiptap/pm/model'
import type { EditorState } from '@tiptap/pm/state'

import { getNodeType } from './getNodeType.js'

/**
 * Read the attributes of the first node of this type in the current selection.
 * @returns The attributes, or an empty object when no such node is selected.
 */
export function getNodeAttributes(
  state: EditorState,
  typeOrName: string | NodeType,
): Record<string, any> {
  const type = getNodeType(typeOrName, state.schema)
  const { from, to } = state.selection
  const nodes: Node[] = []

  state.doc.nodesBetween(from, to, node => {
    nodes.push(node)
  })

  const node = nodes.reverse().find(nodeItem => nodeItem.type.name === type.name)

  if (!node) {
    return {}
  }

  return { ...node.attrs }
}
