import { Editor } from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { coordsAtPos } from './helpers'

export interface BubbleMenuPluginProps {
  editor: Editor,
  element: HTMLElement,
  keepInBounds: boolean,
}

export type BubbleMenuViewProps = BubbleMenuPluginProps & {
  view: EditorView,
}

export class BubbleMenuView {
  public editor: Editor

  public element: HTMLElement

  public keepInBounds = true

  public view: EditorView

  public isActive = false

  public top = 0

  public bottom = 0

  public left = 0

  public preventHide = false

  constructor({
    editor,
    element,
    keepInBounds,
    view,
  }: BubbleMenuViewProps) {
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
    const docHasChanged = !oldState?.doc.eq(doc)
    const selectionHasChanged = !oldState?.selection.eq(selection)

    if (composing || (!docHasChanged && !selectionHasChanged)) {
      return
    }

    const { from, to, empty } = selection
    const parent = this.element.offsetParent

    if (empty || !parent) {
      this.hide()

      return
    }

    const start = coordsAtPos(view, from)
    const end = coordsAtPos(view, to, true)
    const parentBox = parent.getBoundingClientRect()
    const box = this.element.getBoundingClientRect()
    const left = (start.left + end.left) / 2 - parentBox.left

    this.isActive = true
    this.top = Math.round(end.bottom - parentBox.top)
    this.bottom = Math.round(parentBox.bottom - start.top)
    this.left = Math.round(
      this.keepInBounds
        ? Math.min(parentBox.width - box.width / 2, Math.max(left, box.width / 2))
        : left,
    )

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

export const BubbleMenuPluginKey = new PluginKey('menuBubble')

export const BubbleMenuPlugin = (options: BubbleMenuPluginProps) => {
  return new Plugin({
    key: BubbleMenuPluginKey,
    view: view => new BubbleMenuView({ view, ...options }),
  })
}
