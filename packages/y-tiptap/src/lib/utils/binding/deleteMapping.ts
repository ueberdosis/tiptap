import type { ProsemirrorMapping } from '../../../types/ProsemirrorMapping.js'
import * as Y from 'yjs'
import { projectedMappings } from './projectedMappings.js'

export const deleteMapping = (mapping: ProsemirrorMapping, type: unknown) => {
  if (!(type instanceof Y.XmlFragment || type instanceof Y.Text || type instanceof Y.XmlHook)) {
    return
  }

  mapping.delete(type)
  projectedMappings.get(mapping)?.delete(type)
}
