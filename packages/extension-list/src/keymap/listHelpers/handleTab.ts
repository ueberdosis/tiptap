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

  // gap cursors satisfy both checks above but resolve outside a textblock
  if (!$from.parent.isTextblock) return false

  // Tab inside a list item belongs to sinkListItem
  if (isNodeActive(state, name)) return false

  const previous = getPreviousBlockSibling($from)
  if (!previous || !parentListTypes.includes(previous.type.name)) return false

  const lastItem = previous.lastChild
  if (!lastItem || lastItem.type.name !== name) return false

  const block = $from.parent

  if (!lastItem.canReplace(lastItem.childCount, lastItem.childCount, Fragment.from(block))) {
    return false
  }

  const blockStart = $from.before()
  const blockEnd = $from.after()

  // step back over the closing tokens of the list and its last item
  const insideLastItemEnd = blockStart - 2

  return editor.commands.command(({ tr, dispatch }) => {
    if (dispatch) {
      tr.delete(blockStart, blockEnd).insert(insideLastItemEnd, Fragment.from(block))
      // place the cursor at the start of the inserted block
      tr.setSelection(TextSelection.create(tr.doc, insideLastItemEnd + 1))
      tr.scrollIntoView()
    }

    return true
  })
}
