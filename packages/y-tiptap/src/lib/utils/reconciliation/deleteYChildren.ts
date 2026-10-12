import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import * as Y from 'yjs'
import { deleteMapping } from '../binding/deleteMapping.js'

export const deleteYChildren = (
  yDomFragment: Y.XmlFragment,
  index: number,
  length: number,
  meta: BindingMetadata,
) => {
  if (length > 0) {
    yDomFragment.slice(index, index + length).forEach(type => deleteMapping(meta.mapping, type))
    yDomFragment.delete(index, length)
  }
}
