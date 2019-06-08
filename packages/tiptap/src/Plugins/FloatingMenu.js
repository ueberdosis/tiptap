import { Plugin, PluginKey } from 'prosemirror-state'

class Menu {

  constructor({ options, editorView }) {
    this.options = {
      ...{
        element: null,
        onUpdate: () => false,
      },
      ...options,
    }
    this.editorView = editorView
    this.isActive = false
    this.top = 0

    this.options.editor.on('focus', ({ view }) => {
      this.update(view)
    })
    this.options.editor.on('blur', event => {
      this.hide(event)
    })
  }

  update(view, lastState) {
    const { state } = view

    // Don't do anything if the document/selection didn't change
    if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
      return
    }

    if (!state.selection.empty) {
      this.hide()
      return
    }

    const currentDom = view.domAtPos(state.selection.anchor)

    const isActive = currentDom.node.innerHTML === '<br>'
      && currentDom.node.tagName === 'P'
      && currentDom.node.parentNode === view.dom

    if (!isActive) {
      this.hide()
      return
    }

    const editorBoundings = this.options.element.offsetParent.getBoundingClientRect()
    const cursorBoundings = view.coordsAtPos(state.selection.anchor)
    const top = cursorBoundings.top - editorBoundings.top

    this.isActive = true
    this.top = top

    this.sendUpdate()
  }

  sendUpdate() {
    this.options.onUpdate({
      isActive: this.isActive,
      top: this.top,
    })
  }

  hide(event) {
    if (event && event.relatedTarget) {
      return
    }

    this.isActive = false
    this.sendUpdate()
  }

}

export default function (options) {
  return new Plugin({
    key: new PluginKey('floating_menu'),
    view(editorView) {
      return new Menu({ editorView, options })
    },
  })
}
