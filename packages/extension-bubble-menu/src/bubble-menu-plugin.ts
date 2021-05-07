import { Editor, posToDOMRect } from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import tippy, { Instance, Props } from 'tippy.js'

export interface BubbleMenuPluginProps {
  editor: Editor,
  element: HTMLElement,
  tippyOptions?: Partial<Props>,
}

export type BubbleMenuViewProps = BubbleMenuPluginProps & {
  view: EditorView,
}

export class BubbleMenuView {
  public editor: Editor

  public element: HTMLElement

  public view: EditorView

  public preventHide = false

  public tippy!: Instance

  constructor({
    editor,
    element,
    view,
    tippyOptions,
  }: BubbleMenuViewProps) {
    this.editor = editor
    this.element = element
    this.view = view
    this.element.addEventListener('mousedown', this.mousedownHandler, { capture: true })
    this.editor.on('focus', this.focusHandler)
    this.editor.on('blur', this.blurHandler)
    this.createTooltip(tippyOptions)
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

  createTooltip(options: Partial<Props> = {}) {
    this.tippy = tippy(this.view.dom, {
      duration: 0,
      getReferenceClientRect: null,
      content: this.element,
      interactive: true,
      trigger: 'manual',
      placement: 'top',
      hideOnClick: 'toggle',
      ...options,
    })
  }

  update(view: EditorView, oldState?: EditorState) {
    const { state, composing } = view
    const { doc, selection } = state
    const isSame = oldState && oldState.doc.eq(doc) && oldState.selection.eq(selection)

    if (composing || isSame) {
      return
    }

    const { empty, $anchor, ranges } = selection

    // support for CellSelections
    const from = Math.min(...ranges.map(range => range.$from.pos))
    const to = Math.max(...ranges.map(range => range.$to.pos))

    // Sometime check for `empty` is not enough.
    // Doubleclick an empty paragraph returns a node size of 2.
    // So we check also for an empty text size.
    if (empty || !$anchor.parent.textContent) {
      this.hide()

      return
    }

    this.tippy.setProps({
      getReferenceClientRect: () => posToDOMRect(view, from, to),
    })

    this.show()
  }

  show() {
    this.tippy.show()
  }

  hide() {
    this.tippy.hide()
  }

  destroy() {
    this.tippy.destroy()
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
