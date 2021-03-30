import { Editor } from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { coordsAtPos } from './helpers'

export interface BubbleMenuPluginOptions {
  editor: Editor,
  element: HTMLElement,
  keepInBounds: boolean,
}

export type BubbleMenuViewOptions = BubbleMenuPluginOptions & {
  view: EditorView,
}

export class BubbleMenuView {
  public editor: Editor

  public element: HTMLElement

  public keepInBounds = true

  public view: EditorView

  public isActive = false

  public left = 0

  public bottom = 0

  public top = 0

  public preventHide = false

  constructor({
    editor,
    element,
    keepInBounds,
    view,
  }: BubbleMenuViewOptions) {
    this.editor = editor
    this.element = element
    this.keepInBounds = keepInBounds
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
    this.update(this.editor.view)
  }

  blurHandler = ({ event }: { event: FocusEvent }) => {
    if (this.preventHide) {
      this.preventHide = false
      return
    }

    this.hide(event)
  }

  update(view: EditorView, oldState?: EditorState) {
    const { state, composing } = view
    const { doc, selection } = state
    const docHasChanged = !oldState?.doc.eq(doc)
    const selectionHasChanged = !oldState?.selection.eq(selection)

    if (composing || (!docHasChanged && !selectionHasChanged)) {
      return
    }

    const { from, to, empty } = selection

    if (empty) {
      this.hide()

      return
    }

    const start = coordsAtPos(view, from)
    const end = coordsAtPos(view, to, true)
    const parent = this.element.offsetParent

    if (!parent) {
      this.hide()

      return
    }

    const parentBox = parent.getBoundingClientRect()
    const box = this.element.getBoundingClientRect()
    const left = (start.left + end.left) / 2 - parentBox.left

    this.left = Math.round(
      this.keepInBounds
        ? Math.min(parentBox.width - box.width / 2, Math.max(left, box.width / 2))
        : left,
    )
    this.bottom = Math.round(parentBox.bottom - start.top)
    this.top = Math.round(end.bottom - parentBox.top)
    this.isActive = true

    this.render()
  }

  render() {
    Object.assign(this.element.style, {
      position: 'absolute',
      zIndex: 1000,
      visibility: this.isActive ? 'visible' : 'hidden',
      opacity: this.isActive ? 1 : 0,
      left: `${this.left}px`,
      // top: `${this.top}px`,
      bottom: `${this.bottom}px`,
      transform: 'translateX(-50%)',
    })
  }

  hide(event?: FocusEvent) {
    if (
      event?.relatedTarget
      && this.element.parentNode?.contains(event.relatedTarget as Node)
    ) {
      return
    }

    this.isActive = false
    this.render()
  }

  destroy() {
    this.element.removeEventListener('mousedown', this.mousedownHandler)
    this.editor.off('focus', this.focusHandler)
    this.editor.off('blur', this.blurHandler)
  }
}

export const BubbleMenuPlugin = (options: BubbleMenuPluginOptions) => {
  return new Plugin({
    key: new PluginKey('menuBubble'),
    view: view => new BubbleMenuView({ view, ...options }),
  })
}
