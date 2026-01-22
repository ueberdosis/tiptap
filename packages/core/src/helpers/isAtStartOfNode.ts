import type { EditorState } from '@dibdab/pm/state'

export const isAtStartOfNode = (state: EditorState) => {
  const { $from, $to } = state.selection

  if ($from.parentOffset > 0 || $from.pos !== $to.pos) {
    return false
  }

  return true
}
