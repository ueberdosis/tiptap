import type { NodeView } from '@tiptap/pm/view'

import type { ResizableNodeViewOptions } from './resizable/index.js'
import { createResizableNodeView as createResizableNodeViewModular } from './resizable/index.js'

export * from './resizable/index.js'

/**
 * Creates a resizable node view for Tiptap
 *
 * @example
 * ```js
 * addNodeView() {
 *   return ({ node, getPos, editor }) => {
 *     const img = document.createElement('img')
 *     img.src = node.attrs.src
 *
 *     const resizable = createResizableNodeView({
 *       dom: img,
 *       editor,
 *       getPos,
 *       node,
 *       minWidth: 100,
 *       minHeight: 50,
 *     })
 *
 *     return { dom: resizable }
 *   }
 * }
 * ```
 */
export function createResizableNodeView(options: ResizableNodeViewOptions): NodeView {
  const view = createResizableNodeViewModular(options)

  return {
    dom: view,
    update(...args) {
      const [updatedNode] = args

      if (updatedNode.type !== options.node.type || !options.onUpdate) {
        return false
      }

      return options.onUpdate(...args)
    },
    destroy() {
      view.remove()
    },
  }
}
