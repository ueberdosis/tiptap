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
  pluginKey: PluginKey | string,
  editor: Editor,
  element: HTMLElement,
  tippyOptions?: Partial<Props>,
  shouldShow: ((props: {
    editor: Editor,
    view: EditorView,
    state: EditorState,
    oldState?: EditorState,
    from: number,
    to: number,
  }) => boolean) | null,
}

export type BubbleMenuViewProps = BubbleMenuPluginProps & {
  view: EditorView,
}

export class BubbleMenuView {
  public editor: Editor

  public element: HTMLElement

  public view: EditorView

  public preventHide = false

  public tippy: Instance | undefined

  public shouldShow: Exclude<BubbleMenuPluginProps['shouldShow'], null> = ({ state, from, to }) => {
    const { doc, selection } = state
    const { empty } = selection

    // Sometime check for `empty` is not enough.
    // Doubleclick an empty paragraph returns a node size of 2.
    // So we check also for an empty text size.
    const isEmptyTextBlock = !doc.textBetween(from, to).length
      && isTextSelection(state.selection)

    if (empty || isEmptyTextBlock) {
      return false
    }

    return true
  }

  constructor({
    editor,
    element,
    view,
    tippyOptions,
    shouldShow,
  }: BubbleMenuViewProps) {
    this.editor = editor
    this.element = element
    this.view = view

    if (shouldShow) {
      this.shouldShow = shouldShow
    }

    this.element.addEventListener('mousedown', this.mousedownHandler, { capture: true })
    this.view.dom.addEventListener('dragstart', this.dragstartHandler)
    this.editor.on('focus', this.focusHandler)
    this.editor.on('blur', this.blurHandler)
    this.element.style.visibility = 'visible'

    // We create tippy asynchronously to make sure that `editor.options.element`
    // has already been moved to the right position in the DOM
    requestAnimationFrame(() => {
      this.createTooltip(tippyOptions)
    })
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

  createTooltip(options: Partial<Props> = {}) {
    this.tippy = tippy(this.editor.options.element, {
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

    // support for CellSelections
    const { ranges } = selection
    const from = Math.min(...ranges.map(range => range.$from.pos))
    const to = Math.max(...ranges.map(range => range.$to.pos))

    const shouldShow = this.shouldShow({
      editor: this.editor,
      view,
      state,
      oldState,
      from,
      to,
    })

    if (!shouldShow) {
      this.hide()

      return
    }

    this.tippy?.setProps({
      getReferenceClientRect: () => {
        if (isNodeSelection(state.selection)) {
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
    this.tippy?.show()
  }

  hide() {
    this.tippy?.hide()
  }

  destroy() {
    this.tippy?.destroy()
    this.element.removeEventListener('mousedown', this.mousedownHandler)
    this.view.dom.removeEventListener('dragstart', this.dragstartHandler)
    this.editor.off('focus', this.focusHandler)
    this.editor.off('blur', this.blurHandler)
  }
}

export const BubbleMenuPlugin = (options: BubbleMenuPluginProps) => {
  return new Plugin({
    key: typeof options.pluginKey === 'string'
      ? new PluginKey(options.pluginKey)
      : options.pluginKey,
    view: view => new BubbleMenuView({ view, ...options }),
  })
}
