import type { AbsolutePosition } from 'yjs'

import type { ProsemirrorMapping } from '../../../types/ProsemirrorMapping.js'
import type { YType } from '../../../types/YType.js'
import { getYType } from './getYType.js'
import { getYTypeSize } from './getYTypeSize.js'

export function getParentOffset(
  parent: YType,
  type: AbsolutePosition['type'],
  mapping: ProsemirrorMapping,
): number | null {
  let offset = 0
  let item = parent._first

  while (item !== null) {
    const child = getYType(item)

    if (child === type) {
      break
    }

    const deleted = item.deleted
    item = item.right

    if (deleted) {
      continue
    }

    if (child === null) {
      return null
    }

    const size = getYTypeSize(child, mapping)

    if (size === null) {
      return null
    }

    offset += size
  }

  return offset
}
