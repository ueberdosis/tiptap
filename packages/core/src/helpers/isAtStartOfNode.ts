import type { EditorState } from '@tiptap/pm/state'

/**
 * Check whether the cursor sits at the start of its parent node.
 */
export const isAtStartOfNode = (state: EditorState) => {
  const { $from, $to } = state.selection

  if ($from.parentOffset > 0 || $from.pos !== $to.pos) {
    return false
  }

  return true
}
