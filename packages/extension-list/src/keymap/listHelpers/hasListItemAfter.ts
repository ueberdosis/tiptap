import type { EditorState } from '@tiptap/pm/state'

/**
 * Whether there is a list item after this one.
 */
export const hasListItemAfter = (typeOrName: string, state: EditorState): boolean => {
  const { $anchor } = state.selection

  const $targetPos = state.doc.resolve($anchor.pos - $anchor.parentOffset - 2)

  if ($targetPos.index() === $targetPos.parent.childCount - 1) {
    return false
  }

  if ($targetPos.nodeAfter?.type.name !== typeOrName) {
    return false
  }

  return true
}
