import { Fragment, type Node as ProseMirrorNode, type NodeType } from '@tiptap/pm/model'

// Keep the content and the attributes both item types share
const changeListItemType = (item: ProseMirrorNode, itemType: NodeType) => {
  if (item.type === itemType) {
    return item
  }

  const attrs = Object.fromEntries(
    Object.entries(item.attrs).filter(([name]) => name in itemType.attrs),
  )

  return itemType.create(attrs, item.content, itemType.allowedMarks(item.marks))
}

/**
 * Recreate every list item in `items` as `itemType`. Returns null when the
 * content of any item does not fit `itemType`.
 */
export function changeListItemsType(items: Fragment, itemType: NodeType): Fragment | null {
  const changed: ProseMirrorNode[] = []

  for (let index = 0; index < items.childCount; index += 1) {
    const item = items.child(index)

    if (!itemType.validContent(item.content)) {
      return null
    }

    changed.push(changeListItemType(item, itemType))
  }

  return Fragment.from(changed)
}
