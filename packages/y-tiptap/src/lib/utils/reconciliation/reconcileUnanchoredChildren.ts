import type { FragmentUpdater } from '../../../types/FragmentUpdater.js'
import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { NormalizedPNodeContent } from '../../../types/NormalizedPNodeContent.js'
import type { TransactionSource } from '../../../types/TransactionSource.js'
import * as Y from 'yjs'
import { chooseMatchingSide } from './chooseMatchingSide.js'
import { deleteYChildren } from './deleteYChildren.js'
import { insertPChildren } from './insertPChildren.js'
import { updateMatchingYChild } from './updateMatchingYChild.js'

/** Updates a range of Yjs children to match a range of ProseMirror children, keeping as many elements as it can. */
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
  while (yStart < yEnd && pStart < pEnd) {
    const side = chooseMatchingSide(
      yChildren[yStart],
      pChildren[pStart],
      yChildren[yEnd - 1],
      pChildren[pEnd - 1],
      meta,
    )

    if (side === 'right') {
      updateMatchingYChild(y, yChildren[yEnd - 1], pChildren[pEnd - 1], meta, updateFragment)
      yEnd -= 1
      pEnd -= 1
      continue
    }

    if (side === 'left') {
      updateMatchingYChild(y, yChildren[yStart], pChildren[pStart], meta, updateFragment)
    } else {
      deleteYChildren(yDomFragment, pStart, 1, meta)
      insertPChildren(yDomFragment, pStart, pChildren, pStart, pStart + 1, meta)
    }
    yStart += 1
    pStart += 1
  }

  deleteYChildren(yDomFragment, pStart, yEnd - yStart, meta)
  insertPChildren(yDomFragment, pStart, pChildren, pStart, pEnd, meta)
}
