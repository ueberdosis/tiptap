import { Node, NodeType } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'

import { getNodeType } from './getNodeType.js'

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
