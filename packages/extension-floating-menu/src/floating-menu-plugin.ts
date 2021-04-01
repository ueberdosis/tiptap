import { Editor } from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

export interface FloatingMenuPluginProps {
  editor: Editor,
  element: HTMLElement,
}

export type FloatingMenuViewProps = FloatingMenuPluginProps & {
  view: EditorView,
}

export class FloatingMenuView {
  public editor: Editor

  public element: HTMLElement

  public view: EditorView

  public isActive = false

  public top = 0

  public preventHide = false

  constructor({
    editor,
    element,
    view,
  }: FloatingMenuViewProps) {
    this.editor = editor
    this.element = element
    this.view = view
    this.element.addEventListener('mousedown', this.mousedownHandler, { capture: true })
    this.editor.on('focus', this.focusHandler)
    this.editor.on('blur', this.blurHandler)
    this.render()
  }

  mousedownHandler = () => {
    this.preventHide = true
  }

  focusHandler = () => {
    // we use `setTimeout` to make sure `selection` is already updated
    setTimeout(() => this.update(this.editor.view))
  }

  blurHandler = ({ event }: { event: FocusEvent }) => {
    if (this.preventHide) {
      this.preventHide = false

      return
    }

    if (
      event?.relatedTarget
      && this.element.parentNode?.contains(event.relatedTarget as Node)
    ) {
      return
    }

    this.hide()
  }

  update(view: EditorView, oldState?: EditorState) {
    const { state, composing } = view
    const { doc, selection } = state
    const isSame = oldState && oldState.doc.eq(doc) && oldState.selection.eq(selection)

    if (composing || isSame) {
      return
    }

    const { anchor, empty } = selection
    const parent = this.element.offsetParent
    const currentDom = view.domAtPos(anchor)
    const currentElement = currentDom.node as Element
    const isActive = currentElement.innerHTML === '<br>'
      && currentElement.tagName === 'P'
      && currentElement.parentNode === view.dom

    if (!empty || !parent || !isActive) {
      this.hide()

      return
    }

    const parentBox = parent.getBoundingClientRect()
    const cursorCoords = view.coordsAtPos(anchor)
    const top = cursorCoords.top - parentBox.top

    this.isActive = true
    this.top = top

    this.render()
  }

  render() {
    Object.assign(this.element.style, {
      position: 'absolute',
      zIndex: 1,
      visibility: this.isActive ? 'visible' : 'hidden',
      opacity: this.isActive ? 1 : 0,
      // left: `${this.left}px`,
      top: `${this.top}px`,
      // bottom: `${this.bottom}px`,
    })
  }

  hide() {
    this.isActive = false
    this.render()
  }

  destroy() {
    this.element.removeEventListener('mousedown', this.mousedownHandler)
    this.editor.off('focus', this.focusHandler)
    this.editor.off('blur', this.blurHandler)
  }
}

export const FloatingMenuPluginKey = new PluginKey('menuFloating')

export const FloatingMenuPlugin = (options: FloatingMenuPluginProps) => {
  return new Plugin({
    key: FloatingMenuPluginKey,
    view: view => new FloatingMenuView({ view, ...options }),
  })
}
