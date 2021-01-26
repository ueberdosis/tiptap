import isNodeSelection from './isNodeSelection'
import equalNodeType from './equalNodeType'

export default function findSelectedNodeOfType(nodeType) {
  // eslint-disable-next-line
  return function (selection) {
    if (isNodeSelection(selection)) {
      const { node } = selection
          const { $from } = selection

      if (equalNodeType(nodeType, node)) {
        return { node, pos: $from.pos, depth: $from.depth }
      }
    }
  }
}
