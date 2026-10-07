import { Fragment } from '@tiptap/pm/model'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

import { createNode } from './createNode.js'
import { flushPendingContent } from './flushPendingContent.js'
import type {
  ConvertListItems,
  ListConversionContext,
  ListItemConversionState,
} from './listConversionTypes.js'

/** Preserves a nested list when supported or flattens its converted items. */
export function appendNestedList(
  sourceList: ProseMirrorNode,
  state: ListItemConversionState,
  context: ListConversionContext,
  convertListItems: ConvertListItems,
): boolean {
  const nestedItems = convertListItems(sourceList, context)

  if (!nestedItems) {
    return false
  }

  const nestedList = createNode(context.listType, Fragment.from(nestedItems), sourceList.attrs)

  if (!nestedList) {
    return false
  }

  if (context.itemType.validContent(Fragment.from([...state.pendingContent, nestedList]))) {
    state.pendingContent.push(nestedList)
    return true
  }

  if (!flushPendingContent(state, context.itemType)) {
    return false
  }

  state.items.push(...nestedItems)

  return true
}
