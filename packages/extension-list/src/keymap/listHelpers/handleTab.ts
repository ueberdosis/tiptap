import type { Editor } from '@tiptap/core'
import { getPreviousBlockSibling, isNodeActive } from '@tiptap/core'
import { Fragment } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'

export const handleTab = (editor: Editor, name: string, parentListTypes: string[]) => {
  const { state } = editor
  const { selection } = state
  if (!selection.empty) return false

  const { $from } = selection
  if ($from.parentOffset !== 0) return false

  // A GapCursor also satisfies the two checks above but resolves inside a
  // non-textblock parent, where the position math below would move whole
  // block containers and produce an invalid text selection.
  if (!$from.parent.isTextblock) return false

  // Bail when the cursor is already inside a list item. ListItem and TaskItem
  // own Tab themselves (sinkListItem) and we should not double-handle it.
  if (isNodeActive(state, name)) return false

  const previous = getPreviousBlockSibling($from)
  if (!previous || !parentListTypes.includes(previous.type.name)) return false

  const lastItem = previous.lastChild
  if (!lastItem || lastItem.type.name !== name) return false

  const block = $from.parent

  // Bail when the block wouldn't fit the list item's schema.
  if (!lastItem.canReplace(lastItem.childCount, lastItem.childCount, Fragment.from(block))) {
    return false
  }

  const blockStart = $from.before()
  const blockEnd = $from.after()

  // `blockStart` sits in the shared parent right after the previous list.
  // Walk back two positions to land inside the previous list's last item at
  // its end (one for the closing token of the list, one for the closing
  // token of the last item).
  const insideLastItemEnd = blockStart - 2

  return editor.commands.command(({ tr, dispatch }) => {
    if (dispatch) {
      tr.delete(blockStart, blockEnd).insert(insideLastItemEnd, Fragment.from(block))
      // Cursor lands right inside the inserted block at its start: one position
      // past the insertion point steps over the block's opening token.
      tr.setSelection(TextSelection.create(tr.doc, insideLastItemEnd + 1))
      tr.scrollIntoView()
    }

    return true
  })
}
