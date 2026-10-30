import { Fragment } from '@tiptap/pm/model'
import type { Node as ProseMirrorNode, NodeType } from '@tiptap/pm/model'

import { flushPendingContent } from './flushPendingContent.js'
import type { ListItemConversionState } from './listConversionTypes.js'

/** Appends a content node to the current item or starts a new item when needed. */
export function appendContentNode(
  node: ProseMirrorNode,
  state: ListItemConversionState,
  itemType: NodeType,
): boolean {
  if (itemType.validContent(Fragment.from([...state.pendingContent, node]))) {
    state.pendingContent.push(node)
    return true
  }

  if (!flushPendingContent(state, itemType) || !itemType.validContent(Fragment.from(node))) {
    return false
  }

  state.pendingContent.push(node)

  return true
}
