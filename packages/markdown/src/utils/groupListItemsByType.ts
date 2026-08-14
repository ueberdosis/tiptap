import type { MarkdownToken } from '@tiptap/core'
import type { Token } from 'marked'

import { isTaskItem } from './isTaskItem.js'
import { toTaskItemToken, type TaskListItemToken } from './toTaskItemToken.js'

export type ListItemGroup = {
  type: 'list' | 'taskList'
  items: (MarkdownToken | TaskListItemToken)[]
}

/**
 * Group mixed list items by whether they are task items.
 */
export function groupListItemsByType(
  items: MarkdownToken[],
  tokenizeBlock: (src: string) => Token[],
  tokenizeInline: (src: string) => MarkdownToken[],
): ListItemGroup[] {
  const groups: ListItemGroup[] = []
  let currentGroup: (MarkdownToken | TaskListItemToken)[] = []
  let currentType: 'list' | 'taskList' | null = null

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    const { isTask } = isTaskItem(item)
    const processedItem = isTask ? toTaskItemToken(item, tokenizeBlock, tokenizeInline) : item

    const itemType: 'list' | 'taskList' = isTask ? 'taskList' : 'list'

    if (currentType !== itemType) {
      if (currentGroup.length > 0) {
        groups.push({ type: currentType!, items: currentGroup })
      }
      currentGroup = [processedItem]
      currentType = itemType
    } else {
      currentGroup.push(processedItem)
    }
  }

  if (currentGroup.length > 0) {
    groups.push({ type: currentType!, items: currentGroup })
  }

  return groups
}
