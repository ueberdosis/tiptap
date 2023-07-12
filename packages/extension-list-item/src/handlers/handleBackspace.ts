import { Editor, isAtStartOfNode, isNodeActive } from '@tiptap/core'

import {
  findListItemPos, hasListItemBefore, listItemHasSubList,
} from '../helpers/index.js'

export const handleBackspace = (editor: Editor, name: string) => {
  // this is required to still handle the undo handling
  if (editor.commands.undoInputRule()) {
    return true
  }

  // if the cursor is not inside the current node type
  // do nothing and proceed
  if (!isNodeActive(editor.state, name)) {
    return false
  }

  // if the cursor is not at the start of a node
  // do nothing and proceed
  if (!isAtStartOfNode(editor.state)) {
    return false
  }

  const listItemPos = findListItemPos(name, editor.state)

  if (!listItemPos) {
    return false
  }

  const $prev = editor.state.doc.resolve(listItemPos.$pos.pos - 2)
  const prevNode = $prev.node(listItemPos.depth)

  const previousListItemHasSubList = listItemHasSubList(name, editor.state, prevNode)

  // if the previous item is a list item and doesn't have a sublist, join the list items
  if (hasListItemBefore(name, editor.state) && !previousListItemHasSubList) {
    return editor.commands.joinListItemBackward(name)
  }

  // otherwise in the end, a backspace should
  // always just lift the list item if
  // joining / merging is not possible
  return editor.chain().liftListItem(name).run()
}
