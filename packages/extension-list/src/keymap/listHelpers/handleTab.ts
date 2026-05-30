import type { Editor } from '@tiptap/core'
import { getPreviousBlockSibling, isNodeActive } from '@tiptap/core'
import { Fragment } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'

export const handleTab = (editor: Editor, name: string, parentListTypes: string[]) => {
  const { state, view } = editor
  const { selection } = state
  if (!selection.empty) return false

  const { $from } = selection
  if ($from.parentOffset !== 0) return false

  // Bail when the cursor is already inside a list item. ListItem and TaskItem
  // own Tab themselves (sinkListItem) and we should not double-handle it.
  if (isNodeActive(state, name)) return false

  const previous = getPreviousBlockSibling($from)
  if (!previous || !parentListTypes.includes(previous.type.name)) return false

  const lastItem = previous.lastChild
  if (!lastItem || lastItem.type.name !== name) return false

  const block = $from.parent
  const blockStart = $from.before()
  const blockEnd = $from.after()

  // `blockStart` sits in the shared parent right after the previous list.
  // Walk back two positions to land inside the previous list's last item at
  // its end (one for the closing token of the list, one for the closing
  // token of the last item).
  const insideLastItemEnd = blockStart - 2

  const tr = state.tr
  tr.delete(blockStart, blockEnd).insert(insideLastItemEnd, Fragment.from(block))
  // Cursor lands right inside the inserted block at its start: one position
  // past the insertion point steps over the block's opening token.
  tr.setSelection(TextSelection.create(tr.doc, insideLastItemEnd + 1))
  view.dispatch(tr.scrollIntoView())
  return true
}
