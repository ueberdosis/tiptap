import { Node } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'

import { getNodeType } from '../../../core/src/helpers/getNodeType.js'

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
