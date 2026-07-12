import type { Fragment, Node as ProseMirrorNode, NodeType } from '@tiptap/pm/model'

/** Creates a node when its content and required attributes are valid. */
export function createNode(type: NodeType, content: Fragment): ProseMirrorNode | null {
  if (!type.validContent(content)) {
    return null
  }

  try {
    return type.create(null, content)
  } catch {
    return null
  }
}
