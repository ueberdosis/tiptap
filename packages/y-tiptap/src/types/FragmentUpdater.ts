import type { Node } from 'prosemirror-model'
import type { XmlFragment } from 'yjs'
import type { TransactionSource } from './TransactionSource.js'
import type { BindingMetadata } from './BindingMetadata.js'

export type FragmentUpdater = (
  document: TransactionSource,
  fragment: XmlFragment,
  node: Node,
  metadata: BindingMetadata,
) => void
