import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { NormalizedPNodeContent } from '../../../types/NormalizedPNodeContent.js'
import type { MappedChildAnchor } from '../../../types/MappedChildAnchor.js'
import * as PModel from 'prosemirror-model'
import * as Y from 'yjs'
import { mappedIdentity } from './mappedIdentity.js'

export const findMappedChildAnchors = (
  yChildren: (Y.XmlElement<{ [key: string]: string }> | Y.XmlHook | Y.XmlText)[],
  pChildren: NormalizedPNodeContent,
  meta: BindingMetadata,
) => {
  const pChildIndices = new Map<PModel.Node | PModel.Node[], number>()
  pChildren.forEach((pChild, index) => {
    if (!pChildIndices.has(pChild)) {
      pChildIndices.set(pChild, index)
    }
  })
  const candidates: MappedChildAnchor[] = []
  yChildren.forEach((yChild, yIndex) => {
    const mapped = meta.mapping.get(yChild)
    const pIndex = mapped === undefined ? undefined : pChildIndices.get(mapped)
    if (pIndex !== undefined && mappedIdentity(mapped, pChildren[pIndex])) {
      candidates.push({ yIndex, pIndex, yChild })
    }
  })
  if (candidates.length === 0) {
    return []
  }
  // The longest increasing subsequence keeps the most mapped children in their shared order.
  const predecessors: number[] = []
  const tails: number[] = []
  for (let index = 0; index < candidates.length; index++) {
    let low = 0
    let high = tails.length
    while (low < high) {
      const middle = (low + high) >> 1
      if (candidates[tails[middle]].pIndex < candidates[index].pIndex) {
        low = middle + 1
      } else {
        high = middle
      }
    }
    predecessors[index] = low > 0 ? tails[low - 1] : -1
    tails[low] = index
  }
  const anchors: MappedChildAnchor[] = []
  for (let index = tails[tails.length - 1]; index !== -1; index = predecessors[index]) {
    anchors.push(candidates[index])
  }
  return anchors.reverse()
}
