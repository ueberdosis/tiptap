import type { DragHandleRule } from '../types/rules.js'

/**
 * The first child inside a list item is the list item's content.
 * It cannot be dragged separately - you drag the list item instead.
 *
 * Example: In `<li><p>Text</p></li>`, the paragraph is excluded,
 * but the listItem is draggable.
 */
export const listItemFirstChild: DragHandleRule = {
  id: 'listItemFirstChild',
  evaluate: ({ parent, isFirst }) => {
    if (!isFirst) {
      return 0
    }

    const listItemTypes = ['listItem', 'taskItem']

    if (parent && listItemTypes.includes(parent.type.name)) {
      return 1000
    }

    return 0
  },
}

/**
 * Inline nodes (text, marks, inline atoms) should never be drag targets.
 */
export const inlineContent: DragHandleRule = {
  id: 'inlineContent',
  evaluate: ({ node }) => {
    if (node.isInline || node.isText) {
      return 1000
    }

    return 0
  },
}

/**
 * All default rules.
 * Users can extend these or replace them entirely.
 */
export const defaultRules: DragHandleRule[] = [listItemFirstChild, inlineContent]
