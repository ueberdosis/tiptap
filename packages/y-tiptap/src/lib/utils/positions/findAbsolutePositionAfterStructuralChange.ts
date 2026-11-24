import { attrsEqual } from './attrsEqual.js'
import { Node } from 'prosemirror-model'
import { hasDistinctiveAttrs } from './hasDistinctiveAttrs.js'

/** Recovers a position in a moved block, returning null when the match is ambiguous. */
export const findAbsolutePositionAfterStructuralChange = (
  oldDoc: Node,
  newDoc: Node,
  absPos: number,
): number | null => {
  let pos = 0
  let targetIdx = 0
  for (; targetIdx < oldDoc.childCount; targetIdx++) {
    const child = oldDoc.child(targetIdx)
    if (pos + child.nodeSize > absPos) {
      break
    }
    pos += child.nodeSize
  }
  if (targetIdx >= oldDoc.childCount) {
    return null
  }
  const targetChild = oldDoc.child(targetIdx)
  const $oldPos = oldDoc.resolve(absPos)
  const place = (newBlockStart: number, newBlock: Node) => {
    if ($oldPos.depth === 0) {
      const remapped = newBlockStart + (absPos - pos)
      const contentStart = newBlockStart + 1
      const contentEnd = newBlockStart + newBlock.nodeSize - 1
      return Math.max(contentStart, Math.min(remapped, contentEnd))
    }
    if ($oldPos.depth > 1) {
      const innerPosition = findAbsolutePositionAfterStructuralChange(
        $oldPos.node(1),
        newBlock,
        $oldPos.pos - $oldPos.start(1),
      )

      return innerPosition === null ? null : newBlockStart + 1 + innerPosition
    }

    if (!newBlock.isTextblock) {
      return null
    }

    return newBlockStart + 1 + Math.min($oldPos.parentOffset, newBlock.content.size)
  }
  const findByPredicate = (pred: (arg0: Node) => boolean, requireUnique: boolean = false) => {
    let occurrence = 0
    for (let i = 0; i <= targetIdx; i++) {
      if (pred(oldDoc.child(i))) {
        occurrence++
      }
    }
    let matchCount = 0
    let matchStart = -1
    let matchBlock = null
    let newPos = 0
    for (let i = 0; i < newDoc.childCount; i++) {
      const child = newDoc.child(i)
      if (pred(child)) {
        matchCount++
        if (matchCount === occurrence) {
          matchStart = newPos
          matchBlock = child
        }
      }
      newPos += child.nodeSize
    }
    if (matchBlock === null || (requireUnique && (occurrence !== 1 || matchCount !== 1))) {
      return null
    }
    return place(matchStart, matchBlock)
  }
  const sameTypeAndAttrs = (child: Node) =>
    child.type === targetChild.type && attrsEqual(child.attrs, targetChild.attrs)
  const oldText = targetChild.textContent
  const byAll = findByPredicate(child => sameTypeAndAttrs(child) && child.textContent === oldText)
  if (byAll !== null) {
    return byAll
  }
  const byText = findByPredicate(
    child => child.type === targetChild.type && child.textContent === oldText,
  )
  if (byText !== null) {
    return byText
  }
  if (!targetChild.isTextblock || hasDistinctiveAttrs(targetChild)) {
    const byAttrs = findByPredicate(sameTypeAndAttrs, true)
    if (byAttrs !== null) {
      return byAttrs
    }
  }
  return findByPredicate(
    child =>
      sameTypeAndAttrs(child) &&
      oldText !== '' &&
      child.textContent !== '' &&
      (oldText.startsWith(child.textContent) || child.textContent.startsWith(oldText)),
    true,
  )
}
