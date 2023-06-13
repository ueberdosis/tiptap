import { getNodeType } from '@tiptap/core'
import { EditorState } from '@tiptap/pm/state'
import { ResolvedPos } from 'prosemirror-model'

export const getCurrentListItemPos = (typeOrName: string, state: EditorState): ResolvedPos | undefined => {
  const { $from } = state.selection
  const nodeType = getNodeType(typeOrName, state.schema)

  let currentNode = null
  let currentDepth = $from.depth
  let currentPos = $from.pos
  let targetDepth: number | null = null

  while (currentDepth > 0 && targetDepth === null) {
    currentNode = $from.node(currentDepth)

    if (currentNode.type === nodeType) {
      targetDepth = currentDepth
    } else {
      currentDepth -= 1
      currentPos -= 1
    }
  }

  if (targetDepth === null) {
    return
  }

  return state.doc.resolve(currentPos)
}
