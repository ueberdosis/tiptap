import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import * as PModel from 'prosemirror-model'
import * as math from 'lib0/math'
import * as Y from 'yjs'
import { normalizePNodeContent } from '../conversion/normalizePNodeContent.js'
import { equalYTypePNode } from './equalYTypePNode.js'
import { mappedIdentity } from './mappedIdentity.js'

export const computeChildEqualityFactor = (
  ytype: Y.XmlElement<{ [key: string]: string }>,
  pnode: PModel.Node,
  meta: BindingMetadata,
) => {
  const yChildren = ytype.toArray()
  const pChildren = normalizePNodeContent(pnode)
  const pChildCnt = pChildren.length
  const yChildCnt = yChildren.length
  const minCnt = math.min(yChildCnt, pChildCnt)
  let left = 0
  let right = 0
  let foundMappedChild = false
  for (; left < minCnt; left++) {
    const leftY = yChildren[left]
    const leftP = pChildren[left]
    if (mappedIdentity(meta.mapping.get(leftY), leftP)) {
      foundMappedChild = true
    } else if (!equalYTypePNode(leftY, leftP)) {
      break
    }
  }
  for (; left + right < minCnt; right++) {
    const rightY = yChildren[yChildCnt - right - 1]
    const rightP = pChildren[pChildCnt - right - 1]
    if (mappedIdentity(meta.mapping.get(rightY), rightP)) {
      foundMappedChild = true
    } else if (!equalYTypePNode(rightY, rightP)) {
      break
    }
  }
  return {
    equalityFactor: left + right,
    foundMappedChild,
  }
}
