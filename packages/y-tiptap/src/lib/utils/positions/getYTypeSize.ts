import { Node } from 'prosemirror-model'
import { XmlText } from 'yjs'

import type { ProsemirrorMapping } from '../../../types/ProsemirrorMapping.js'
import type { YType } from '../../../types/YType.js'

export function getYTypeSize(type: YType, mapping: ProsemirrorMapping): number | null {
  if (type instanceof XmlText) {
    return type._length
  }

  const node = mapping.get(type)

  return node instanceof Node ? node.nodeSize : null
}
