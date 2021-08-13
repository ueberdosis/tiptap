import { Editor, posToDOMRect } from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import tippy, { Instance, Props } from 'tippy.js'

export interface FloatingMenuPluginProps {
  pluginKey: PluginKey | string,
  editor: Editor,
  element: HTMLElement,
  tippyOptions?: Partial<Props>,
  shouldShow: ((props: {
    editor: Editor,
    view: EditorView,
    state: EditorState,
    oldState?: EditorState,
  }) => boolean) | null,
}

export type FloatingMenuViewProps = FloatingMenuPluginProps & {
  view: EditorView,
}

export class FloatingMenuView {
  public editor: Editor

  public element: HTMLElement

  public view: EditorView

  public preventHide = false

  public tippy: Instance | undefined

  public shouldShow: Exclude<FloatingMenuPluginProps['shouldShow'], null> = ({ state }) => {
    const { selection } = state
    const { $anchor, empty } = selection
    const isRootDepth = $anchor.depth === 1
    const isEmptyTextBlock = $anchor.parent.isTextblock
      && !$anchor.parent.type.spec.code
      && !$anchor.parent.textContent

    if (!empty || !isRootDepth || !isEmptyTextBlock) {
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
  }: FloatingMenuViewProps) {
    this.editor = editor
    this.element = element
    this.view = view

    if (shouldShow) {
      this.shouldShow = shouldShow
    }

    this.element.addEventListener('mousedown', this.mousedownHandler, { capture: true })
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
      placement: 'right',
      hideOnClick: 'toggle',
      ...options,
    })
  }

  update(view: EditorView, oldState?: EditorState) {
    const { state, composing } = view
    const { doc, selection } = state
    const { from, to } = selection
    const isSame = oldState && oldState.doc.eq(doc) && oldState.selection.eq(selection)

    if (composing || isSame) {
      return
    }

    const shouldShow = this.shouldShow({
      editor: this.editor,
      view,
      state,
      oldState,
    })

    if (!shouldShow) {
      this.hide()

      return
    }

    this.tippy?.setProps({
      getReferenceClientRect: () => posToDOMRect(view, from, to),
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
    this.editor.off('focus', this.focusHandler)
    this.editor.off('blur', this.blurHandler)
  }
}

export const FloatingMenuPlugin = (options: FloatingMenuPluginProps) => {
  return new Plugin({
    key: typeof options.pluginKey === 'string'
      ? new PluginKey(options.pluginKey)
      : options.pluginKey,
    view: view => new FloatingMenuView({ view, ...options }),
  })
}
