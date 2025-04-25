import type {
  ResizableNodeViewDiagonalDirection,
  ResizableNodeViewDirection,
  ResizableNodeViewDirections,
  ResizableNodeViewOptions,
} from './resizable/index.js'
import { createResizableNodeView as createResizableNodeViewModular } from './resizable/index.js'

export type {
  ResizableNodeViewDiagonalDirection,
  ResizableNodeViewDirection,
  ResizableNodeViewDirections,
  ResizableNodeViewOptions,
}

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
export function createResizableNodeView(options: ResizableNodeViewOptions): HTMLElement {
  return createResizableNodeViewModular(options)
}
