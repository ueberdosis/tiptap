import { Node as ProseMirrorNode } from '@tiptap/pm/model'

/**
 * Returns true if the given node is empty.
 * When `checkChildren` is true (default), it will also check if all children are empty.
 */
export function isNodeEmpty(
  node: ProseMirrorNode,
  { checkChildren }: { checkChildren: boolean } = { checkChildren: true },
): boolean {
  if (node.isText) {
    return !node.text
  }

  if (node.content.childCount === 0) {
    return true
  }

  if (node.isLeaf) {
    return false
  }

  if (checkChildren) {
    let hasSameContent = true

    node.content.forEach(childNode => {
      if (hasSameContent === false) {
        // Exit early for perf
        return
      }

      if (!isNodeEmpty(childNode)) {
        hasSameContent = false
      }
    })

    return hasSameContent
  }

  return false
}
