import type { Node } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

export function getViewportBoundaryPositions({ doc, view }: { doc: Node; view: EditorView }) {
  const editorRect = view.dom.getBoundingClientRect()

  // Intersection of the editor rect and the viewport
  const visibleLeft = editorRect.left
  const visibleTop = Math.max(editorRect.top, 0)
  const visibleBottom = Math.min(editorRect.bottom, window.innerHeight)

  if (visibleTop >= visibleBottom) {
    // Editor is not visible — fall back to full document range
    return { top: 0, bottom: doc.content.size }
  }

  const topPos = view.posAtCoords({ left: visibleLeft + 1, top: visibleTop + 1 })
  const bottomPos = view.posAtCoords({ left: visibleLeft + 1, top: visibleBottom - 1 })

  return {
    top: topPos ? topPos.pos : 0,
    bottom: bottomPos ? bottomPos.pos : doc.content.size,
  }
}
