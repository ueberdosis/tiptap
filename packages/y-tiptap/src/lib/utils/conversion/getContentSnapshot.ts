import type * as Y from 'yjs'
import { isVisible } from '../binding/isVisible.js'

export const getContentSnapshot = (
  type: Y.XmlElement | Y.XmlText,
  snapshot?: Y.Snapshot,
  prevSnapshot?: Y.Snapshot,
) => {
  if (snapshot === undefined || prevSnapshot === undefined || type._item === null) {
    return snapshot
  }
  if (isVisible(type._item, snapshot)) {
    return snapshot
  }
  return isVisible(type._item, prevSnapshot) ? prevSnapshot : undefined
}
