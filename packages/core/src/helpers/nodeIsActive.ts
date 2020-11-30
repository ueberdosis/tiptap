import { EditorState } from 'prosemirror-state'
import { Node, NodeType } from 'prosemirror-model'
import objectIncludes from '../utilities/objectIncludes'
import getNodeType from '../helpers/getNodeType'

type NodeRange = {
  node: Node,
  from: number,
  to: number,
}

export default function nodeIsActive(state: EditorState, typeOrName: NodeType | string | null, attributes = {}) {
  const { from, to, empty } = state.selection
  const type = typeOrName
    ? getNodeType(typeOrName, state.schema)
    : null

  let nodeRanges: NodeRange[] = []

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText) {
      const relativeFrom = Math.max(from, pos)
      const relativeTo = Math.min(to, pos + node.nodeSize)

      nodeRanges = [...nodeRanges, {
        node,
        from: relativeFrom,
        to: relativeTo,
      }]
    }
  })

  if (empty) {
    return !!nodeRanges
      .filter(nodeRange => {
        if (!type) {
          return true
        }

        return type.name === nodeRange.node.type.name
      })
      .find(nodeRange => objectIncludes(nodeRange.node.attrs, attributes))
  }

  const range = nodeRanges
    .filter(nodeRange => {
      if (!type) {
        return true
      }

      return type.name === nodeRange.node.type.name
    })
    .filter(nodeRange => objectIncludes(nodeRange.node.attrs, attributes))
    .reduce((sum, nodeRange) => {
      const size = nodeRange.to - nodeRange.from
      return sum + size
    }, 0)

  const selectionRange = to - from

  return selectionRange <= range
}
