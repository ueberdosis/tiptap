import { Editor } from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import tippy from 'tippy.js'
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

  public view: EditorView

  public preventHide = false

  public tippy: any = null

  constructor({
    editor,
    element,
    view,
  }: BubbleMenuViewProps) {
    this.editor = editor
    this.element = element
    this.view = view
    this.element.addEventListener('mousedown', this.mousedownHandler, { capture: true })
    this.editor.on('focus', this.focusHandler)
    this.editor.on('blur', this.blurHandler)
    this.createTooltip()
    this.element.style.visibility = 'visible'
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

  createTooltip() {
    this.tippy = tippy('body', {
      // delay: [0, 2000],
      duration: 0,
      getReferenceClientRect: null,
      appendTo: () => document.body,
      content: this.element,
      interactive: true,
      trigger: 'manual',
      placement: 'top',
      hideOnClick: 'toggle',
    })
  }

  update(view: EditorView, oldState?: EditorState) {
    const { state, composing } = view
    const { doc, selection } = state
    const isSame = oldState && oldState.doc.eq(doc) && oldState.selection.eq(selection)

    if (composing || isSame) {
      return
    }

    const { from, to, empty } = selection

    if (empty) {
      this.hide()

      return
    }

    this.tippy[0].setProps({
      getReferenceClientRect: () => {
        const start = coordsAtPos(view, from)
        const end = coordsAtPos(view, to, true)
        const top = Math.min(start.top, end.top)
        const bottom = Math.max(start.bottom, end.bottom)
        const left = Math.min(start.left, end.left)
        const right = Math.max(start.right, end.right)

        return {
          width: right - left,
          height: bottom - top,
          top,
          bottom,
          left,
          right,
        }
      },
    })

    this.show()
  }

  show() {
    this.tippy[0].show()
  }

  hide() {
    this.tippy[0].hide()
  }

  destroy() {
    this.tippy[0].destroy()
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
