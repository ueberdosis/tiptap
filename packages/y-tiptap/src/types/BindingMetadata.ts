import type { MarkType } from 'prosemirror-model'
import type { XmlText } from 'yjs'
import type { ProsemirrorMapping } from './ProsemirrorMapping.js'

/** Mapping and overlapping-mark cache shared by document conversions. */
export interface BindingMetadata {
  mapping: ProsemirrorMapping
  isOMark: Map<MarkType, boolean>
  /** When set, content that does not fit the schema is skipped and reported instead of deleted. */
  reportInvalidContent?: (error: Error) => void
  /** When set, receives text to merge with the next text instead of merging it during conversion. */
  deferTextMerge?: (text: XmlText) => void
}
