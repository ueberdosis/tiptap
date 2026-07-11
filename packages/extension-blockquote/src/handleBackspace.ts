import type { Editor } from '@tiptap/core'
import type { NodeType } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'

/**
 * Restructure the blockquote boundary at the caret.
 *
 * Two cases are handled in a single backspace:
 *
 * 1. Caret at the start of a non-first child of a blockquote — lift the
 *    current child out, splitting the blockquote around it.
 * 2. Caret at the start of a top-level textblock whose previous sibling is
 *    a blockquote with a textblock last child — merge the current
 *    textblock's inline content into the blockquote's last textblock
 *    instead of letting joinBackward pull the paragraph back inside.
 *
 * Returns true when the backspace was consumed.
 */
export const handleBackspace = (editor: Editor, type: NodeType): boolean => {
  const { state, view } = editor
  const { selection } = state
  if (!selection.empty) return false

  const { $from } = selection
  if ($from.parentOffset !== 0) return false

  const parentDepth = $from.depth - 1
  // At the very start of the document the caret can resolve to the top (doc)
  // level — for example a gap cursor before a leading image — where there is
  // no parent block. Bail out so backspace is a no-op instead of dereferencing
  // an undefined parent at a negative depth. (#7973)
  if (parentDepth < 0) return false

  const parent = $from.node(parentDepth)
  const index = $from.index(parentDepth)
  if (index === 0) return false

  // Non-first child of a blockquote: lift to split the blockquote around it.
  if (parent.type === type) {
    return editor.commands.lift(type.name)
  }

  // Previous sibling is a blockquote whose last child is a textblock:
  // merge the inline content in instead of letting joinBackward pull the
  // paragraph back inside the blockquote.
  const previous = parent.child(index - 1)
  if (previous.type !== type || !previous.lastChild?.isTextblock) {
    return false
  }

  const blockStart = $from.before()
  // `blockStart` sits in the shared parent at the position right after
  // the previous blockquote. In ProseMirror coordinates, each closing
  // token costs one position: step one back to land inside the blockquote
  // right after its last child, then one more to land inside that last
  // child at the end of its inline content.
  const insideBlockquoteEnd = blockStart - 1
  const targetPos = insideBlockquoteEnd - 1
  const { tr } = state
  tr.delete(blockStart, $from.after()).insert(targetPos, $from.parent.content)
  tr.setSelection(TextSelection.create(tr.doc, targetPos))
  view.dispatch(tr.scrollIntoView())
  return true
}
