import { Plugin, PluginKey } from 'prosemirror-state'

function textRange(node, from, to) {
  const range = document.createRange()
  range.setEnd(node, to == null ? node.nodeValue.length : to)
  range.setStart(node, Math.max(from, 0))
  return range
}

function singleRect(object, bias) {
  const rects = object.getClientRects()
  return !rects.length ? object.getBoundingClientRect() : rects[bias < 0 ? 0 : rects.length - 1]
}

function coordsAtPos(view, pos, end = false) {
  const { node, offset } = view.docView.domFromPos(pos)
  let side
  let rect
  if (node.nodeType === 3) {
    if (end && offset < node.nodeValue.length) {
      rect = singleRect(textRange(node, offset - 1, offset), -1)
      side = 'right'
    } else if (offset < node.nodeValue.length) {
      rect = singleRect(textRange(node, offset, offset + 1), -1)
      side = 'left'
    }
  } else if (node.firstChild) {
    if (offset < node.childNodes.length) {
      const child = node.childNodes[offset]
      rect = singleRect(child.nodeType === 3 ? textRange(child) : child, -1)
      side = 'left'
    }
    if ((!rect || rect.top === rect.bottom) && offset) {
      const child = node.childNodes[offset - 1]
      rect = singleRect(child.nodeType === 3 ? textRange(child) : child, 1)
      side = 'right'
    }
  } else {
    rect = node.getBoundingClientRect()
    side = 'left'
  }

  const x = rect[side]

  return {
    top: rect.top,
    bottom: rect.bottom,
    left: x,
    right: x,
  }
}

class Menu {

  constructor({ options, editorView }) {
    this.options = {
      ...{
        element: null,
        keepInBounds: true,
        onUpdate: () => false,
      },
      ...options,
    }
    this.editorView = editorView
    this.isActive = false
    this.left = 0
    this.bottom = 0
    this.top = 0
    this.preventHide = false

    // the mousedown event is fired before blur so we can prevent it
    this.mousedownHandler = this.handleClick.bind(this)
    this.options.element.addEventListener('mousedown', this.mousedownHandler, { capture: true })

    this.focusHandler = ({ view }) => {
      this.update(view)
    }
    this.options.editor.on('focus', this.focusHandler)

    this.blurHandler = ({ event }) => {
      if (this.preventHide) {
        this.preventHide = false
        return
      }

      this.hide(event)
    }
    this.options.editor.on('blur', this.blurHandler)
  }

  handleClick() {
    this.preventHide = true
  }

  update(view, lastState) {
    const { state } = view

    if (view.composing) {
      return
    }

    // Don't do anything if the document/selection didn't change
    if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
      return
    }

    // Hide the tooltip if the selection is empty
    if (state.selection.empty) {
      this.hide()
      return
    }

    // Otherwise, reposition it and update its content
    const { from, to } = state.selection

    // These are in screen coordinates
    // We can't use EditorView.cordsAtPos here because it can't handle linebreaks correctly
    // See: https://github.com/ProseMirror/prosemirror-view/pull/47
    const start = coordsAtPos(view, from)
    const end = coordsAtPos(view, to, true)

    // The box in which the tooltip is positioned, to use as base
    const parent = this.options.element.offsetParent

    if (!parent) {
      this.hide()
      return
    }

    const box = parent.getBoundingClientRect()
    const el = this.options.element.getBoundingClientRect()

    // Find a center-ish x position from the selection endpoints (when
    // crossing lines, end may be more to the left)
    const left = ((start.left + end.left) / 2) - box.left

    // Keep the menuBubble in the bounding box of the offsetParent i
    this.left = Math.round(this.options.keepInBounds
        ? Math.min(box.width - (el.width / 2), Math.max(left, el.width / 2)) : left)
    this.bottom = Math.round(box.bottom - start.top)
    this.top = Math.round(end.bottom - box.top)
    this.isActive = true

    this.sendUpdate()
  }

  sendUpdate() {
    this.options.onUpdate({
      isActive: this.isActive,
      left: this.left,
      bottom: this.bottom,
      top: this.top,
    })
  }

  hide(event) {
    if (event
      && event.relatedTarget
      && this.options.element.parentNode
      && this.options.element.parentNode.contains(event.relatedTarget)
    ) {
      return
    }

    this.isActive = false
    this.sendUpdate()
  }

  destroy() {
    this.options.element.removeEventListener('mousedown', this.mousedownHandler)
    this.options.editor.off('focus', this.focusHandler)
    this.options.editor.off('blur', this.blurHandler)
  }

}

export default function (options) {
  return new Plugin({
    key: new PluginKey('menu_bubble'),
    view(editorView) {
      return new Menu({ editorView, options })
    },
  })
}
