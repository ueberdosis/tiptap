import { getNodeAtPosition } from '@dibdab/core'
import type { EditorState } from '@dibdab/pm/state'

import { findListItemPos } from './findListItemPos.js'

export const getNextListDepth = (typeOrName: string, state: EditorState) => {
  const listItemPos = findListItemPos(typeOrName, state)

  if (!listItemPos) {
    return false
  }

  const [, depth] = getNodeAtPosition(state, typeOrName, listItemPos.$pos.pos + 4)

  return depth
}
