import type { EditorState } from '@tiptap/pm/state'

import { findListItemPos } from './findListItemPos.js'
import { getNextListDepth } from './getNextListDepth.js'

/**
 * Whether the next list item is nested less deeply than this one.
 */
export const nextListIsHigher = (typeOrName: string, state: EditorState) => {
  const listDepth = getNextListDepth(typeOrName, state)
  const listItemPos = findListItemPos(typeOrName, state)

  if (!listItemPos || !listDepth) {
    return false
  }

  if (listDepth < listItemPos.depth) {
    return true
  }

  return false
}
