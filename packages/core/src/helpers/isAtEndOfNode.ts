import { EditorState } from '@tiptap/pm/state'

export const istAtEndOfNode = (state: EditorState) => {
  const { $from, $to } = state.selection

  if ($to.parentOffset < $to.parent.nodeSize - 2 || $from.pos !== $to.pos) {
    return false
  }

  return true
}
