import { EditorState } from 'prosemirror-state'
import { Node, NodeType } from 'prosemirror-model'
import getNodeType from './getNodeType'

export default function getNodeAttributes(state: EditorState, typeOrName: string | NodeType) {
  const type = getNodeType(typeOrName, state.schema)
  const { from, to } = state.selection
  let nodes: Node[] = []

  state.doc.nodesBetween(from, to, node => {
    nodes = [...nodes, node]
  })

  const node = nodes
    .reverse()
    .find(nodeItem => nodeItem.type.name === type.name)

  if (node) {
    return { ...node.attrs }
  }

  return {}
}
