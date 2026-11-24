import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { NormalizedPNodeContent } from '../../../types/NormalizedPNodeContent.js'
import * as Y from 'yjs'
import { createTypeFromTextOrElementNode } from '../conversion/createTypeFromTextOrElementNode.js'

export const insertPChildren = (
  yDomFragment: Y.XmlFragment,
  index: number,
  pChildren: NormalizedPNodeContent,
  start: number,
  end: number,
  meta: BindingMetadata,
) => {
  if (start < end) {
    const children = []
    for (let childIndex = start; childIndex < end; childIndex++) {
      children.push(createTypeFromTextOrElementNode(pChildren[childIndex], meta))
    }
    yDomFragment.insert(index, children)
  }
}
