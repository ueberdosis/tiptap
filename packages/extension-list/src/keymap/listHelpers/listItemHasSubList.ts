import { getNodeType } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'
import type { EditorState } from '@tiptap/pm/state'

export const listItemHasSubList = (typeOrName: string, state: EditorState, node?: PMNode) => {
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
