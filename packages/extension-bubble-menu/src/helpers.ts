import { EditorView } from 'prosemirror-view'

type DOMRectSide = 'bottom' | 'left' | 'right' | 'top';

function textRange(node: Node, from?: number, to?: number) {
  const range = document.createRange()
  range.setEnd(node, typeof to === 'number' ? to : (node.nodeValue || '').length)
  range.setStart(node, Math.max(from || 0, 0))

  return range
}

function singleRect(object: Range | Element, bias: number) {
  const rects = object.getClientRects()
  return !rects.length
    ? object.getBoundingClientRect()
    : rects[bias < 0 ? 0 : rects.length - 1]
}

export function coordsAtPos(view: EditorView, pos: number, end = false) {
  const { node, offset } = view.domAtPos(pos) // view.docView.domFromPos(pos);
  let side: DOMRectSide | null = null
  let rect: DOMRect | null = null
  if (node.nodeType === 3) {
    const nodeValue = node.nodeValue || ''
    if (end && offset < nodeValue.length) {
      rect = singleRect(textRange(node, offset - 1, offset), -1)
      side = 'right'
    } else if (offset < nodeValue.length) {
      rect = singleRect(textRange(node, offset, offset + 1), -1)
      side = 'left'
    }
  } else if (node.firstChild) {
    if (offset < node.childNodes.length) {
      const child = node.childNodes[offset]
      rect = singleRect(
        child.nodeType === 3 ? textRange(child) : (child as Element),
        -1,
      )
      side = 'left'
    }
    if ((!rect || rect.top === rect.bottom) && offset) {
      const child = node.childNodes[offset - 1]
      rect = singleRect(
        child.nodeType === 3 ? textRange(child) : (child as Element),
        1,
      )
      side = 'right'
    }
  } else {
    const element = node as Element
    rect = element.getBoundingClientRect()
    side = 'left'
  }

  if (rect && side) {
    const x = rect[side]

    return {
      top: rect.top,
      bottom: rect.bottom,
      left: x,
      right: x,
    }
  }
  return {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }
}
