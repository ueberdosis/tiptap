import { getNodeType } from '@tiptap/core'
import { NodeType } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'

export const findListItemPos = (typeOrName: string | NodeType, state: EditorState) => {
  const { $from } = state.selection
  const nodeType = getNodeType(typeOrName, state.schema)

  let currentDepth = $from.depth
  let currentPos = $from.pos
  let targetDepth: number | null = null

  while (currentDepth > 0 && targetDepth === null) {
    const currentNode = $from.node(currentDepth)

    if (currentNode.type === nodeType) {
      targetDepth = currentDepth
    } else {
      currentDepth -= 1
      currentPos -= 1
    }
  }

  if (targetDepth === null) {
    return null
  }

  return { $pos: state.doc.resolve(currentPos), depth: targetDepth }
}

export const isNodeAtCursor = (typeOrName: string, state: EditorState) => {
  const listItemPos = findListItemPos(typeOrName, state)

  if (!listItemPos) {
    return false
  }

  return true
}

export const isAtStartOfNode = (state: EditorState) => {
  const { $from, $to } = state.selection

  if ($from.parentOffset > 0 || $from.pos !== $to.pos) {
    return false
  }

  return true
}

export const hasPreviousListItem = (typeOrName: string, state: EditorState) => {
  const listItemPos = findListItemPos(typeOrName, state)

  if (!listItemPos) {
    return false
  }

  const $prev = state.doc.resolve(listItemPos.$pos.pos - 2)

  if (listItemPos.$pos.depth === $prev.depth) {
    return true
  }

  return false
}
