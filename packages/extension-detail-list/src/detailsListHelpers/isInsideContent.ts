import type { EditorState } from '@tiptap/pm/state'

export const isInsideContent = (typeOrName: string, state: EditorState) => {
  const { $anchor } = state.selection
  const parentNode = $anchor.node($anchor.depth - 1)
  const isContentNode = parentNode.type.name === typeOrName

  if (!parentNode || !isContentNode) {
    return false
  }

  return true
}
