import type { Node } from 'prosemirror-model'
import type { BindingMetadata } from './BindingMetadata.js'
import type { ProsemirrorMapping } from './ProsemirrorMapping.js'

/** Initial editor document and the caches required to bind its Yjs fragment. */
export interface InitialProseMirrorDoc {
  doc: Node
  meta: BindingMetadata
  mapping: ProsemirrorMapping
}
