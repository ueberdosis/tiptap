import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { TransactionSource } from '../../../types/TransactionSource.js'
import * as PModel from 'prosemirror-model'
import * as math from 'lib0/math'
import { ySyncPluginKey } from '../../plugins/keys.js'
import * as Y from 'yjs'
import { normalizePNodeContent } from '../conversion/normalizePNodeContent.js'
import { equalYTypePNode } from './equalYTypePNode.js'
import { mappedIdentity } from './mappedIdentity.js'
import { reconcileMappedChildren } from './reconcileMappedChildren.js'
import { reconcileUnanchoredChildren } from './reconcileUnanchoredChildren.js'
import { deleteMapping } from '../binding/deleteMapping.js'

/** Updates a Yjs XML fragment to match a ProseMirror node while preserving mapped children. */
export const updateYFragment = (
  y: TransactionSource,
  yDomFragment: Y.XmlFragment,
  pNode: PModel.Node,
  meta: BindingMetadata,
) => {
  if (yDomFragment instanceof Y.XmlElement && yDomFragment.nodeName !== pNode.type.name) {
    throw new Error('node name mismatch!')
  }

  meta.mapping.set(yDomFragment, pNode)

  if (yDomFragment instanceof Y.XmlElement) {
    const yDomAttrs = yDomFragment.getAttributes()
    const pAttrs = pNode.attrs

    for (const key in pAttrs) {
      if (pAttrs[key] === null) {
        yDomFragment.removeAttribute(key)
        continue
      }

      if (yDomAttrs[key] !== pAttrs[key] && key !== 'ychange') {
        yDomFragment.setAttribute(key, pAttrs[key])
      }
    }

    for (const key in yDomAttrs) {
      if (pAttrs[key] === undefined) {
        yDomFragment.removeAttribute(key)
      }
    }
  }

  const pChildren = normalizePNodeContent(pNode)
  const pChildCnt = pChildren.length
  const yChildren = yDomFragment.toArray()
  const yChildCnt = yChildren.length
  const minCnt = math.min(pChildCnt, yChildCnt)

  let reconciled = false

  y.transact(() => {
    reconciled = reconcileMappedChildren(
      y,
      yDomFragment,
      pChildren,
      yChildren,
      meta,
      updateYFragment,
    )
  }, ySyncPluginKey)

  if (reconciled) {
    return
  }

  let left = 0
  let right = 0

  for (; left < minCnt; left++) {
    const leftY = yChildren[left]
    const leftP = pChildren[left]

    if (mappedIdentity(meta.mapping.get(leftY), leftP)) {
      continue
    }

    if (!equalYTypePNode(leftY, leftP)) {
      break
    }

    meta.mapping.set(leftY, leftP)
  }

  for (; right + left + 1 < minCnt; right++) {
    const rightY = yChildren[yChildCnt - right - 1]
    const rightP = pChildren[pChildCnt - right - 1]

    if (mappedIdentity(meta.mapping.get(rightY), rightP)) {
      continue
    }

    if (!equalYTypePNode(rightY, rightP)) {
      break
    }

    meta.mapping.set(rightY, rightP)
  }

  y.transact(() => {
    if (yChildCnt === 1 && pChildCnt === 0 && yChildren[0] instanceof Y.XmlText) {
      // Keep the text type alive so empty-block positions can still resolve.
      deleteMapping(meta.mapping, yChildren[0])
      yChildren[0].delete(0, yChildren[0].length)
      return
    }

    reconcileUnanchoredChildren(
      y,
      yDomFragment,
      pChildren,
      yChildren,
      left,
      yChildCnt - right,
      left,
      pChildCnt - right,
      meta,
      updateYFragment,
    )
  }, ySyncPluginKey)
}
