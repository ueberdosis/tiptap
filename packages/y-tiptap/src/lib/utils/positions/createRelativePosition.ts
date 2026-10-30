import type { YType } from '../../../types/YType.js'
import * as Y from 'yjs'

export const createRelativePosition = (type: YType, item: Y.Item) => {
  let typeid: Y.ID | null = null
  let tname: string | null = null
  if (type._item === null) {
    tname = Y.findRootTypeKey(type)
  } else {
    typeid = Y.createID(type._item.id.client, type._item.id.clock)
  }
  return new Y.RelativePosition(typeid, tname, item.id)
}
