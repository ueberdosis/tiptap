import type { Editor } from '@tiptap/core'
import { isAtStartOfNode, isNodeActive } from '@tiptap/core'
import type { Node } from '@tiptap/pm/model'

import { hasListBefore } from './hasListBefore.js'

export const handleBackspace = (editor: Editor, name: string, parentListTypes: string[]) => {
  // this is required to still handle the undo handling
  if (editor.commands.undoInputRule()) {
    return true
  }

  // if the selection is not collapsed
  // we can rely on the default backspace behavior
  if (editor.state.selection.from !== editor.state.selection.to) {
    return false
  }

  // if the current item is NOT inside a list item &
  // the previous item is a list (orderedList or bulletList)
  // move the cursor into the list and delete the current item
  if (!isNodeActive(editor.state, name) && hasListBefore(editor.state, name, parentListTypes)) {
    const { $anchor } = editor.state.selection

    const $listPos = editor.state.doc.resolve($anchor.before() - 1)

    const listDescendants: Array<{ node: Node; pos: number }> = []

    $listPos.node().descendants((node, pos) => {
      if (node.type.name === name) {
        listDescendants.push({ node, pos })
      }
    })

    const lastItem = listDescendants.at(-1)

    if (!lastItem) {
      return false
    }

    const $lastItemPos = editor.state.doc.resolve($listPos.start() + lastItem.pos + 1)

    return editor
      .chain()
      .cut({ from: $anchor.start() - 1, to: $anchor.end() + 1 }, $lastItemPos.end())
      .joinForward()
      .run()
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

  // only intercept at the start of the list item's first child
  const { $from } = editor.state.selection
  const itemDepth = $from.depth - 1
  if ($from.node(itemDepth).type !== editor.schema.nodes[name] || $from.index(itemDepth) !== 0) {
    return false
  }

  return editor.chain().liftListItem(name).run()
}
