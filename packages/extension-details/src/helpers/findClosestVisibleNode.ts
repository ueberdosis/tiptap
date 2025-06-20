import { Editor, Predicate } from '@tiptap/core'
import { Node as ProseMirrorNode, ResolvedPos } from '@tiptap/pm/model'

import { isNodeVisible } from './isNodeVisible.js'

export const findClosestVisibleNode = ($pos: ResolvedPos, predicate: Predicate, editor: Editor): ({
  pos: number,
  start: number,
  depth: number,
  node: ProseMirrorNode,
} | undefined) => {
  for (let i = $pos.depth; i > 0; i -= 1) {
    const node = $pos.node(i)
    const match = predicate(node)
    const isVisible = isNodeVisible($pos.start(i), editor)

    if (match && isVisible) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node,
      }
    }
  }
}
