import { Node, NodeType } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'

import { getNodeType } from './getNodeType'

export function getNodeAttributes(state: EditorState, typeOrName: string | NodeType): Record<string, any> {
  const type = getNodeType(typeOrName, state.schema)
  const { from, to } = state.selection
  const nodes: Node[] = []

  state.doc.nodesBetween(from, to, node => {
    nodes.push(node)
  })

  const node = nodes
    .reverse()
    .find(nodeItem => nodeItem.type.name === type.name)

  if (!node) {
    return {}
  }

  return { ...node.attrs }
}
