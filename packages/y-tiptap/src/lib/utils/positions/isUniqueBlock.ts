import { Node } from 'prosemirror-model'
import { attrsEqual } from './attrsEqual.js'

/** True when `block` is the only textblock in `doc` with its type and attrs. */
export const isUniqueBlock = (doc: Node, block: Node) => {
  let count = 0
  doc.descendants(node => {
    if (count > 1) {
      return false
    }
    if (node.type === block.type && attrsEqual(node.attrs, block.attrs)) {
      count += 1
    }
    return !node.isTextblock
  })
  return count === 1
}
