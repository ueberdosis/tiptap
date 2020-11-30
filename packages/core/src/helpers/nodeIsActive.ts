import { EditorState } from 'prosemirror-state'
import { Node, NodeType } from 'prosemirror-model'
import objectIncludes from '../utilities/objectIncludes'
import getNodeType from '../helpers/getNodeType'

export default function nodeIsActive(state: EditorState, typeOrName: NodeType | string | null, attributes = {}) {
  const { from, to } = state.selection
  const type = typeOrName
    ? getNodeType(typeOrName, state.schema)
    : null

  let nodes: Node[] = []

  state.doc.nodesBetween(from, to, node => {
    nodes = [...nodes, node]
  })

  const nodeWithAttributes = nodes
    .filter(node => {
      if (!type) {
        return true
      }

      return type.name === node.type.name
    })
    .find(node => objectIncludes(node.attrs, attributes))

  return !!nodeWithAttributes
}
