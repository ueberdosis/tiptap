import type { ProsemirrorMapping } from '../../../types/ProsemirrorMapping.js'
import { getYParent } from './getYParent.js'
import * as Y from 'yjs'
import { getParentOffset } from './getParentOffset.js'
import { getYContentOffset } from './getYContentOffset.js'
import { isMisresolvedTextPosition } from './isMisresolvedTextPosition.js'
import { resolvePositionMigration } from './migrations/resolvePositionMigration.js'

/** Resolves a Yjs relative position, returning null when it cannot be mapped. */
export const relativePositionToAbsolutePosition = (
  y: Y.Doc,
  documentType: Y.XmlFragment,
  relPos: Y.RelativePosition,
  mapping: ProsemirrorMapping,
) => {
  // Structural edits may replace the XML item while persisted anchors keep its old ID.
  const migrated = resolvePositionMigration(documentType, relPos)

  if (!migrated) {
    return null
  }

  relPos = migrated
  const decodedPos = Y.createAbsolutePositionFromRelativePosition(relPos, y)
  if (
    decodedPos === null ||
    (decodedPos.type !== documentType && !Y.isParentOf(documentType, decodedPos.type._item))
  ) {
    return null
  }

  let type = decodedPos.type
  let pos = 0

  if (type.constructor === Y.XmlText) {
    pos = decodedPos.index
  } else if (!type._item?.deleted) {
    const offset = getYContentOffset(type, decodedPos.index, mapping)

    if (offset === null) {
      return null
    }

    pos = offset + 1
  }

  while (type !== documentType && type._item !== null) {
    const parent = getYParent(type._item)

    if (parent === null) {
      return null
    }

    if (parent._item?.deleted) {
      type = parent
      continue
    }

    const offset = getParentOffset(parent, type, mapping)

    if (offset === null) {
      return null
    }

    pos += offset + 1
    type = parent
  }

  // The root fragment has no opening token in ProseMirror's position space.
  const absPos = pos - 1

  if (isMisresolvedTextPosition(y, relPos, absPos)) {
    return null
  }

  return absPos
}
