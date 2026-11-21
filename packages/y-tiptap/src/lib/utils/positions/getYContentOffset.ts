import type { AbsolutePosition } from 'yjs'

import type { ProsemirrorMapping } from '../../../types/ProsemirrorMapping.js'
import { getYType } from './getYType.js'
import { getYTypeSize } from './getYTypeSize.js'

export function getYContentOffset(
  type: AbsolutePosition['type'],
  index: number,
  mapping: ProsemirrorMapping,
): number | null {
  let offset = 0
  let childIndex = 0
  let item = type._first

  while (childIndex < type._length && childIndex < index && item !== null) {
    const current = item
    item = item.right

    if (current.deleted) {
      continue
    }

    const child = getYType(current)

    if (child === null) {
      return null
    }

    const size = getYTypeSize(child, mapping)

    if (size === null) {
      return null
    }

    childIndex++
    offset += size
  }

  return offset
}
