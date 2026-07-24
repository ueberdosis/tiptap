import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

import { convertListItem } from './convertListItem.js'
import type { ListConversionContext } from './listConversionTypes.js'

/** Recursively converts all items in a source list to the target list schema. */
export function convertListItems(
  sourceList: ProseMirrorNode,
  context: ListConversionContext,
): ProseMirrorNode[] | null {
  const convertedItems: ProseMirrorNode[] = []

  for (let index = 0; index < sourceList.childCount; index += 1) {
    const items = convertListItem(sourceList.child(index), context, convertListItems)

    if (!items) {
      return null
    }

    convertedItems.push(...items)
  }

  return convertedItems
}
