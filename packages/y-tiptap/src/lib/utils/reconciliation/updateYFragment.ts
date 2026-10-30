import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { TransactionSource } from '../../../types/TransactionSource.js'
import * as PModel from 'prosemirror-model'
import * as math from 'lib0/math'
import { ySyncPluginKey } from '../../plugins/keys.js'
import * as Y from 'yjs'
import { createTypeFromTextOrElementNode } from '../conversion/createTypeFromTextOrElementNode.js'
import { normalizePNodeContent } from '../conversion/normalizePNodeContent.js'
import { equalYTextPText } from './equalYTextPText.js'
import { equalYTypePNode } from './equalYTypePNode.js'
import { mappedIdentity } from './mappedIdentity.js'
import { reconcileMappedChildren } from './reconcileMappedChildren.js'
import { computeChildEqualityFactor } from './computeChildEqualityFactor.js'
import { updateYText } from './updateYText.js'
import { matchNodeName } from './matchNodeName.js'
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
    while (yChildCnt - left - right > 0 && pChildCnt - left - right > 0) {
      const leftY = yChildren[left]
      const leftP = pChildren[left]
      const rightY = yChildren[yChildCnt - right - 1]
      const rightP = pChildren[pChildCnt - right - 1]

      if (leftY instanceof Y.XmlText && leftP instanceof Array) {
        if (!equalYTextPText(leftY, leftP)) {
          updateYText(leftY, leftP, meta)
        }

        left += 1
        continue
      }

      let updateLeft = leftY instanceof Y.XmlElement && matchNodeName(leftY, leftP)
      let updateRight = rightY instanceof Y.XmlElement && matchNodeName(rightY, rightP)

      if (
        updateLeft &&
        updateRight &&
        leftY instanceof Y.XmlElement &&
        rightY instanceof Y.XmlElement &&
        !Array.isArray(leftP) &&
        !Array.isArray(rightP)
      ) {
        const equalityLeft = computeChildEqualityFactor(leftY, leftP, meta)
        const equalityRight = computeChildEqualityFactor(rightY, rightP, meta)

        // Mapped child identity is stronger evidence than equal content when choosing a side.
        if (equalityLeft.foundMappedChild && !equalityRight.foundMappedChild) {
          updateRight = false
        } else if (!equalityLeft.foundMappedChild && equalityRight.foundMappedChild) {
          updateLeft = false
        } else if (equalityLeft.equalityFactor < equalityRight.equalityFactor) {
          updateLeft = false
        } else {
          updateRight = false
        }
      }

      if (updateLeft && leftY instanceof Y.XmlElement && !Array.isArray(leftP)) {
        updateYFragment(y, leftY, leftP, meta)
        left += 1
        continue
      }

      if (updateRight && rightY instanceof Y.XmlElement && !Array.isArray(rightP)) {
        updateYFragment(y, rightY, rightP, meta)
        right += 1
        continue
      }

      deleteMapping(meta.mapping, yDomFragment.get(left))
      yDomFragment.delete(left, 1)
      yDomFragment.insert(left, [createTypeFromTextOrElementNode(leftP, meta)])
      left += 1
    }

    const yDelLen = yChildCnt - left - right

    if (yChildCnt === 1 && pChildCnt === 0 && yChildren[0] instanceof Y.XmlText) {
      // Keep the text type alive so empty-block positions can still resolve.
      deleteMapping(meta.mapping, yChildren[0])
      yChildren[0].delete(0, yChildren[0].length)
    } else if (yDelLen > 0) {
      yDomFragment.slice(left, left + yDelLen).forEach(type => deleteMapping(meta.mapping, type))
      yDomFragment.delete(left, yDelLen)
    }

    if (left + right >= pChildCnt) {
      return
    }

    const childrenToInsert = []

    for (let index = left; index < pChildCnt - right; index++) {
      childrenToInsert.push(createTypeFromTextOrElementNode(pChildren[index], meta))
    }

    yDomFragment.insert(left, childrenToInsert)
  }, ySyncPluginKey)
}
