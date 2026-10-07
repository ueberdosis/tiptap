import { Fragment } from '@tiptap/pm/model'
import type { NodeType } from '@tiptap/pm/model'

import { createNode } from './createNode.js'
import type { ListItemConversionState } from './listConversionTypes.js'

/** Converts and appends the content accumulated for the current list item. */
export function flushPendingContent(state: ListItemConversionState, itemType: NodeType): boolean {
  if (state.pendingContent.length === 0) {
    return true
  }

  const item = createNode(itemType, Fragment.from(state.pendingContent))

  if (!item) {
    return false
  }

  state.items.push(item)
  state.pendingContent = []

  return true
}
