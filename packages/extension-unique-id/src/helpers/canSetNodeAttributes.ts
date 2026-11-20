import type { Node as PMNode } from '@tiptap/pm/model'

/**
 * Checks if the attributes of the node at `pos` can be changed.
 *
 * Changing attributes rebuilds the node, so ProseMirror checks the content of
 * the node and of its parent, and throws if it breaks the schema.
 */
export function canSetNodeAttributes(doc: PMNode, pos: number): boolean {
  const node = doc.nodeAt(pos)

  if (!node) {
    return false
  }

  const { parent } = doc.resolve(pos)

  return parent.type.validContent(parent.content) && node.type.validContent(node.content)
}
