import { EditorState } from '@tiptap/pm/state'

export const nodeIsEmpty = (state: EditorState) => {
  const { $anchor } = state.selection

  return $anchor.node().content.size === 0
}
