import type { FragmentUpdater } from '../../../types/FragmentUpdater.js'
import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { NormalizedPNodeContent } from '../../../types/NormalizedPNodeContent.js'
import type { TransactionSource } from '../../../types/TransactionSource.js'
import * as math from 'lib0/math'
import * as Y from 'yjs'
import { deleteYChildren } from './deleteYChildren.js'
import { insertPChildren } from './insertPChildren.js'
import { updateMatchingYChild } from './updateMatchingYChild.js'

export const reconcileUnanchoredChildren = (
  y: TransactionSource,
  yDomFragment: Y.XmlFragment,
  pChildren: NormalizedPNodeContent,
  yChildren: (Y.XmlElement<{ [key: string]: string }> | Y.XmlHook | Y.XmlText)[],
  yStart: number,
  yEnd: number,
  pStart: number,
  pEnd: number,
  meta: BindingMetadata,
  updateFragment: FragmentUpdater,
) => {
  const matchingChildren = math.min(yEnd - yStart, pEnd - pStart)
  for (let index = 0; index < matchingChildren; index++) {
    const yChild = yChildren[yStart + index]
    const pChild = pChildren[pStart + index]
    if (!updateMatchingYChild(y, yChild, pChild, meta, updateFragment)) {
      deleteYChildren(yDomFragment, pStart + index, 1, meta)
      insertPChildren(
        yDomFragment,
        pStart + index,
        pChildren,
        pStart + index,
        pStart + index + 1,
        meta,
      )
    }
  }
  deleteYChildren(yDomFragment, pStart + matchingChildren, yEnd - yStart - matchingChildren, meta)
  insertPChildren(
    yDomFragment,
    pStart + matchingChildren,
    pChildren,
    pStart + matchingChildren,
    pEnd,
    meta,
  )
}
