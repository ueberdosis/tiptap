import type { YType } from '../../../types/YType.js'
import type { ProsemirrorMapping } from '../../../types/ProsemirrorMapping.js'
import { getYType } from './getYType.js'
import { getYParent } from './getYParent.js'
import * as Y from 'yjs'
import { Node } from 'prosemirror-model'
import * as error from 'lib0/error'
import { createRelativePosition } from './createRelativePosition.js'

/** Converts a ProseMirror position to a Yjs relative position. */
export const absolutePositionToRelativePosition = (
  pos: number,
  type: Y.XmlFragment,
  mapping: ProsemirrorMapping,
) => {
  if (pos === 0) {
    return Y.createRelativePositionFromTypeIndex(type, 0, -1)
  }
  let n: YType | null = getYType(type._first)
  while (n !== null && type !== n) {
    if (n instanceof Y.XmlText) {
      if (n._length >= pos) {
        return Y.createRelativePositionFromTypeIndex(n, pos, -1)
      } else {
        pos -= n._length
      }
      if (n._item !== null && n._item.next !== null) {
        n = getYType(n._item.next)
      } else {
        do {
          n = getYParent(n._item)
          pos--
        } while (n !== type && n !== null && n._item !== null && n._item.next === null)
        if (n !== null && n !== type) {
          n = n._item === null ? null : getYType(n._item.next)
        }
      }
    } else {
      const mapped = mapping.get(n)
      const pNodeSize = mapped instanceof Node ? mapped.nodeSize : 0
      if (n._first !== null && pos < pNodeSize) {
        n = getYType(n._first)
        pos--
      } else {
        if (pos === 1 && n._length === 0 && pNodeSize > 1) {
          return new Y.RelativePosition(
            n._item === null ? null : n._item.id,
            n._item === null ? Y.findRootTypeKey(n) : null,
            null,
          )
        }
        pos -= pNodeSize
        if (n._item !== null && n._item.next !== null) {
          n = getYType(n._item.next)
        } else {
          if (pos === 0) {
            n = n._item === null ? n : getYParent(n._item)
            if (n === null) throw error.unexpectedCase()
            return new Y.RelativePosition(
              n._item === null ? null : n._item.id,
              n._item === null ? Y.findRootTypeKey(n) : null,
              null,
            )
          }
          do {
            n = getYParent(n._item)
            if (n === null) throw error.unexpectedCase()
            pos--
          } while (n !== type && n._item?.next === null)
          if (n !== type) {
            n = getYType(n._item?.next)
          }
        }
      }
    }
    if (n === null) {
      throw error.unexpectedCase()
    }
    if (pos === 0 && n.constructor !== Y.XmlText && n !== type) {
      const item = n._item
      const parent = getYParent(item)
      if (item === null || parent === null) throw error.unexpectedCase()
      return createRelativePosition(parent, item)
    }
  }
  return Y.createRelativePositionFromTypeIndex(type, type._length, -1)
}
