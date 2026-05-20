import type { Node } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

export function getViewportBoundaryPositions({ doc, view }: { doc: Node; view: EditorView }) {
  const editorRect = view.dom.getBoundingClientRect()

  const visibleTop = Math.max(editorRect.top, 0)
  const visibleBottom = Math.min(editorRect.bottom, window.innerHeight)

  if (visibleTop >= visibleBottom) {
    // Editor is not visible — fall back to full document range
    return { top: 0, bottom: doc.content.size }
  }

  // Pick the x-coordinate based on text direction. In LTR the content
  // starts at the left edge; in RTL it starts at the right edge.
  const isRTL = getComputedStyle(view.dom).direction === 'rtl'
  const x = isRTL ? editorRect.right - 1 : editorRect.left + 1

  const topPos = view.posAtCoords({ left: x, top: visibleTop + 1 })
  const bottomPos = view.posAtCoords({ left: x, top: visibleBottom - 1 })

  return {
    top: topPos ? topPos.pos : 0,
    bottom: bottomPos ? bottomPos.pos : doc.content.size,
  }
}
