import { Editor, isAtEndOfNode, isNodeActive } from '@tiptap/core'

import { nextListIsDeeper } from './nextListIsDeeper.js'
import { nextListIsHigher } from './nextListIsHigher.js'

export const handleDelete = (editor: Editor, name: string) => {
  // if the cursor is not inside the current node type
  // do nothing and proceed
  if (!isNodeActive(editor.state, name)) {
    return false
  }

  // if the cursor is not at the end of a node
  // do nothing and proceed
  if (!isAtEndOfNode(editor.state, name)) {
    return false
  }

  // check if the next node is a list with a deeper depth
  if (nextListIsDeeper(name, editor.state)) {
    return editor
      .chain()
      .focus(editor.state.selection.from + 4)
      .lift(name)
      .joinBackward()
      .run()
  }

  if (nextListIsHigher(name, editor.state)) {
    return editor.chain()
      .joinForward()
      .joinBackward()
      .run()
  }

  return editor.commands.joinItemForward()
}
