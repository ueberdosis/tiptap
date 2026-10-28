import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

import { appendContentNode } from './appendContentNode.js'
import { appendNestedList } from './appendNestedList.js'
import { flushPendingContent } from './flushPendingContent.js'
import type {
  ConvertListItems,
  ListConversionContext,
  ListItemConversionState,
} from './listConversionTypes.js'

/** Converts one source list item into one or more target list items. */
export function convertListItem(
  sourceItem: ProseMirrorNode,
  context: ListConversionContext,
  convertListItems: ConvertListItems,
): ProseMirrorNode[] | null {
  const state: ListItemConversionState = { items: [], pendingContent: [] }

  for (let index = 0; index < sourceItem.childCount; index += 1) {
    const child = sourceItem.child(index)
    const appended = context.isListNode(child)
      ? appendNestedList(child, state, context, convertListItems)
      : appendContentNode(child, state, context.itemType)

    if (!appended) {
      return null
    }
  }

  return flushPendingContent(state, context.itemType) ? state.items : null
}
