import {
  Editor,
  posToDOMRect,
  isTextSelection,
  isNodeSelection,
} from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import tippy, { Instance, Props } from 'tippy.js'

export interface BubbleMenuPluginProps {
  editor: Editor,
  element: HTMLElement,
  hideWhenSelecting?: boolean
  tippyOptions?: Partial<Props>,
}

export type BubbleMenuViewProps = BubbleMenuPluginProps & {
  view: EditorView,
}

export class BubbleMenuView {
  public editor: Editor

  public element: HTMLElement

  public view: EditorView

  public hideWhenSelecting: boolean

  public preventHide = false

  public viewSelecting = false

  public tippy!: Instance

  constructor({
    editor,
    element,
    hideWhenSelecting = false,
    view,
    tippyOptions,
  }: BubbleMenuViewProps) {
    this.editor = editor
    this.element = element
    this.hideWhenSelecting = hideWhenSelecting
    this.view = view
    this.element.addEventListener('mousedown', this.mousedownHandler, { capture: true })
    this.view.dom.addEventListener('dragstart', this.dragstartHandler)
    this.view.dom.addEventListener('mousedown', this.viewMousedownHandler)
    this.view.dom.addEventListener('mouseup', this.viewMouseupHandler)
    this.editor.on('focus', this.focusHandler)
    this.editor.on('blur', this.blurHandler)
    this.createTooltip(tippyOptions)
    this.element.style.visibility = 'visible'
  }

  mousedownHandler = () => {
    this.preventHide = true
  }

  dragstartHandler = () => {
    this.hide()
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

  viewMousedownHandler = () => {
    this.viewSelecting = true
  }

  viewMouseupHandler = () => {
    this.viewSelecting = false
    // we use `setTimeout` to make sure `selection` is already updated
    setTimeout(() => this.update(this.editor.view));
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
    const { viewSelecting } = this
    const { state, composing } = view
    const { doc, selection } = state

    const hideSelecting = this.hideWhenSelecting && viewSelecting
    if (!view.hasFocus() || hideSelecting) {
        this.hide()
        return;
    }

    const isSame = oldState && oldState.doc.eq(doc) && oldState.selection.eq(selection)
    if (composing || isSame) {
      return
    }

    const { empty, ranges } = selection

    // support for CellSelections
    const from = Math.min(...ranges.map(range => range.$from.pos))
    const to = Math.max(...ranges.map(range => range.$to.pos))

    // Sometime check for `empty` is not enough.
    // Doubleclick an empty paragraph returns a node size of 2.
    // So we check also for an empty text size.
    const isEmptyTextBlock = !doc.textBetween(from, to).length
      && isTextSelection(view.state.selection)

    if (empty || isEmptyTextBlock) {
      this.hide()

      return
    }

    this.tippy.setProps({
      getReferenceClientRect: () => {
        if (isNodeSelection(view.state.selection)) {
          const node = view.nodeDOM(from) as HTMLElement

          if (node) {
            return node.getBoundingClientRect()
          }
        }

        return posToDOMRect(view, from, to)
      },
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
    this.view.dom.removeEventListener('dragstart', this.dragstartHandler)
    this.view.dom.removeEventListener('mousedown', this.viewMousedownHandler)
    this.view.dom.removeEventListener('mouseup', this.viewMouseupHandler)
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
