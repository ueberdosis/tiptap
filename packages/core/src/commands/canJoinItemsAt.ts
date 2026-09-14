import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

/** False when the siblings around `pos` are isolating and must not be joined. */
export const canJoinItemsAt = (doc: ProseMirrorNode, pos: number) => {
  const $pos = doc.resolve(pos)
  const before = $pos.nodeBefore
  const after = $pos.nodeAfter

  if (!before || !after) {
    return false
  }

  return !before.type.spec.isolating && !after.type.spec.isolating
}
