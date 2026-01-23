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
 * Nodes that contain list items (listItem/taskItem) as direct children
 * are deprioritized. This makes it easier to target individual list items
 * rather than the entire list wrapper.
 *
 * This rule detects list wrappers dynamically by checking if the first child
 * is a list item, rather than hardcoding wrapper type names.
 *
 * Users can still target the list wrapper by moving to the very edge
 * where edge detection kicks in.
 */
export const listWrapperDeprioritize: DragHandleRule = {
  id: 'listWrapperDeprioritize',
  evaluate: ({ node }) => {
    const listItemTypes = ['listItem', 'taskItem']

    const firstChild = node.firstChild

    if (firstChild && listItemTypes.includes(firstChild.type.name)) {
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
export const defaultRules: DragHandleRule[] = [listItemFirstChild, listWrapperDeprioritize, inlineContent]
