import { EditorState } from 'prosemirror-state'
import { Node, NodeType } from 'prosemirror-model'
import objectIncludes from '../utilities/objectIncludes'
import getNodeType from './getNodeType'
import { AnyObject } from '../types'

export type NodeRange = {
  node: Node,
  from: number,
  to: number,
}

export default function isNodeActive(
  state: EditorState,
  typeOrName: NodeType | string | null,
  attributes: AnyObject = {},
): boolean {
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

  const selectionRange = to - from

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

  return range >= selectionRange
}
