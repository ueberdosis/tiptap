import { getNodeType } from '@tiptap/core'
import { Node, NodeType } from '@tiptap/pm/model'
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

export const istAtEndOfNode = (state: EditorState) => {
  const { $from, $to } = state.selection

  if ($to.parentOffset < $to.parent.nodeSize - 2 || $from.pos !== $to.pos) {
    return false
  }

  return true
}

export const hasPreviousListItem = (typeOrName: string, state: EditorState) => {
  const listItemPos = findListItemPos(typeOrName, state)

  if (!listItemPos) {
    return false
  }

  const $item = state.doc.resolve(listItemPos.$pos.pos)
  const $prev = state.doc.resolve(listItemPos.$pos.pos - 2)

  const prevNode = $prev.node($item.depth)

  if (!prevNode) {
    return false
  }

  return prevNode.type.name === typeOrName
}

export const listItemHasSubList = (typeOrName: string, state: EditorState, node?: Node) => {
  if (!node) {
    return false
  }

  const nodeType = getNodeType(typeOrName, state.schema)

  let hasSubList = false

  node.descendants(child => {
    if (child.type === nodeType) {
      hasSubList = true
    }
  })

  return hasSubList
}
