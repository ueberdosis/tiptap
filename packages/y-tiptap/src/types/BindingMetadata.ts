import type { MarkType } from 'prosemirror-model'
import type { ProsemirrorMapping } from './ProsemirrorMapping.js'

/** Mapping and overlapping-mark cache shared by document conversions. */
export interface BindingMetadata {
  mapping: ProsemirrorMapping
  isOMark: Map<MarkType, boolean>
}
