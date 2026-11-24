import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

/** Finds a descendant node's position relative to its root node. */
export function findNodePosition(root: ProseMirrorNode, target: ProseMirrorNode): number | null {
  let targetPos: number | null = null

  root.descendants((node, pos) => {
    if (node !== target) {
      return true
    }

    targetPos = pos

    return false
  })

  return targetPos
}
