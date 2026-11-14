import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type * as PModel from 'prosemirror-model'
import * as Y from 'yjs'
import { computeChildEqualityFactor } from './computeChildEqualityFactor.js'
import { matchNodeName } from './matchNodeName.js'

type YChild = Y.XmlElement<{ [key: string]: string }> | Y.XmlHook | Y.XmlText
type PChild = PModel.Node | PModel.Node[]

const toMatchingPair = (yChild: YChild, pChild: PChild) =>
  yChild instanceof Y.XmlElement && !(pChild instanceof Array) && matchNodeName(yChild, pChild)
    ? { yChild, pChild }
    : null

const chooseSingleSide = (left: unknown, right: unknown): 'left' | 'right' | null => {
  if (left) {
    return 'left'
  }
  return right ? 'right' : null
}

/**
 * Picks which end of two unreconciled child ranges to update in place.
 * Returns `null` when neither end can be updated.
 */
export const chooseMatchingSide = (
  leftY: YChild,
  leftP: PChild,
  rightY: YChild,
  rightP: PChild,
  meta: BindingMetadata,
): 'left' | 'right' | null => {
  if (leftY instanceof Y.XmlText && leftP instanceof Array) {
    return 'left'
  }
  const left = toMatchingPair(leftY, leftP)
  const right = toMatchingPair(rightY, rightP)
  if (!left || !right) {
    return chooseSingleSide(left, right)
  }

  const equalityLeft = computeChildEqualityFactor(left.yChild, left.pChild, meta)
  const equalityRight = computeChildEqualityFactor(right.yChild, right.pChild, meta)
  // Mapped child identity is stronger evidence than equal content when choosing a side.
  if (equalityLeft.foundMappedChild !== equalityRight.foundMappedChild) {
    return equalityLeft.foundMappedChild ? 'left' : 'right'
  }
  return equalityLeft.equalityFactor < equalityRight.equalityFactor ? 'right' : 'left'
}
