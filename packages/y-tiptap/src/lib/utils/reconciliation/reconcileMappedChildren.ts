import type { FragmentUpdater } from '../../../types/FragmentUpdater.js'
import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { NormalizedPNodeContent } from '../../../types/NormalizedPNodeContent.js'
import type { TransactionSource } from '../../../types/TransactionSource.js'
import * as Y from 'yjs'
import { findMappedChildAnchors } from './findMappedChildAnchors.js'
import { updateMatchingYChild } from './updateMatchingYChild.js'
import { reconcileUnanchoredChildren } from './reconcileUnanchoredChildren.js'

export const reconcileMappedChildren = (
  y: TransactionSource,
  yDomFragment: Y.XmlFragment,
  pChildren: NormalizedPNodeContent,
  yChildren: (Y.XmlElement<{ [key: string]: string }> | Y.XmlHook | Y.XmlText)[],
  meta: BindingMetadata,
  updateFragment: FragmentUpdater,
) => {
  const anchors = findMappedChildAnchors(yChildren, pChildren, meta)
  if (
    anchors.length < 2 ||
    !anchors.some(anchor => anchor.yIndex !== anchor.pIndex) ||
    anchors.some(anchor => {
      const pChild = pChildren[anchor.pIndex]
      return !(
        (anchor.yChild instanceof Y.XmlText && pChild instanceof Array) ||
        (anchor.yChild instanceof Y.XmlElement && !(pChild instanceof Array))
      )
    })
  ) {
    return false
  }
  let yIndex = 0
  let pIndex = 0
  for (const anchor of anchors) {
    reconcileUnanchoredChildren(
      y,
      yDomFragment,
      pChildren,
      yChildren,
      yIndex,
      anchor.yIndex,
      pIndex,
      anchor.pIndex,
      meta,
      updateFragment,
    )
    const pChild = pChildren[anchor.pIndex]
    updateMatchingYChild(y, anchor.yChild, pChild, meta, updateFragment)
    yIndex = anchor.yIndex + 1
    pIndex = anchor.pIndex + 1
  }
  reconcileUnanchoredChildren(
    y,
    yDomFragment,
    pChildren,
    yChildren,
    yIndex,
    yChildren.length,
    pIndex,
    pChildren.length,
    meta,
    updateFragment,
  )
  return true
}
