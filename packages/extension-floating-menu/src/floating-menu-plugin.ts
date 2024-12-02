import {
  Editor, getText, getTextSerializersFromSchema, posToDOMRect,
} from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import tippy, { Instance, Props } from 'tippy.js'

export interface FloatingMenuPluginProps {
  /**
   * The plugin key for the floating menu.
   * @default 'floatingMenu'
   */
  pluginKey: PluginKey | string

  /**
   * The editor instance.
   * @default null
   */
  editor: Editor

  /**
   * The DOM element that contains your menu.
   * @default null
   */
  element: HTMLElement

  /**
   * The options for the tippy instance.
   * @default {}
   * @see https://atomiks.github.io/tippyjs/v6/all-props/
   */
  tippyOptions?: Partial<Props>

  /**
   * A function that determines whether the menu should be shown or not.
   * If this function returns `false`, the menu will be hidden, otherwise it will be shown.
   * @default null
   */
  shouldShow?:
    | ((props: {
        editor: Editor
        view: EditorView
        state: EditorState
        oldState?: EditorState
      }) => boolean)
    | null
}

export type FloatingMenuViewProps = FloatingMenuPluginProps & {
  /**
   * The editor view.
   */
  view: EditorView
}

export class FloatingMenuView {
  public editor: Editor

  public element: HTMLElement

  public view: EditorView

  public preventHide = false

  public tippy: Instance | undefined

  public tippyOptions?: Partial<Props>

  private getTextContent(node:ProseMirrorNode) {
    return getText(node, { textSerializers: getTextSerializersFromSchema(this.editor.schema) })
  }

  public shouldShow: Exclude<FloatingMenuPluginProps['shouldShow'], null> = ({ view, state }) => {
    const { selection } = state
    const { $anchor, empty } = selection
    const isRootDepth = $anchor.depth === 1

    const isEmptyTextBlock = $anchor.parent.isTextblock && !$anchor.parent.type.spec.code && !$anchor.parent.textContent && $anchor.parent.childCount === 0 && !this.getTextContent($anchor.parent)

    if (
      !view.hasFocus()
      || !empty
      || !isRootDepth
      || !isEmptyTextBlock
      || !this.editor.isEditable
    ) {
      return false
    }

    return true
  }

  constructor({
    editor, element, view, tippyOptions = {}, shouldShow,
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
    this.tippyOptions = tippyOptions
    // Detaches menu content from its current parent
    this.element.remove()
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

    if (event?.relatedTarget && this.element.parentNode?.contains(event.relatedTarget as Node)) {
      return
    }

    if (
      event?.relatedTarget === this.editor.view.dom
    ) {
      return
    }

    this.hide()
  }

  tippyBlurHandler = (event: FocusEvent) => {
    this.blurHandler({ event })
  }

  createTooltip() {
    const { element: editorElement } = this.editor.options
    const editorIsAttached = !!editorElement.parentElement

    if (this.tippy || !editorIsAttached) {
      return
    }

    this.tippy = tippy(editorElement, {
      duration: 0,
      getReferenceClientRect: null,
      content: this.element,
      interactive: true,
      trigger: 'manual',
      placement: 'right',
      hideOnClick: 'toggle',
      ...this.tippyOptions,
    })

    // maybe we have to hide tippy on its own blur event as well
    if (this.tippy.popper.firstChild) {
      (this.tippy.popper.firstChild as HTMLElement).addEventListener('blur', this.tippyBlurHandler)
    }
  }

  update(view: EditorView, oldState?: EditorState) {
    const { state } = view
    const { doc, selection } = state
    const { from, to } = selection
    const isSame = oldState && oldState.doc.eq(doc) && oldState.selection.eq(selection)

    if (isSame) {
      return
    }

    this.createTooltip()

    const shouldShow = this.shouldShow?.({
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
      getReferenceClientRect:
        this.tippyOptions?.getReferenceClientRect || (() => posToDOMRect(view, from, to)),
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
    if (this.tippy?.popper.firstChild) {
      (this.tippy.popper.firstChild as HTMLElement).removeEventListener(
        'blur',
        this.tippyBlurHandler,
      )
    }
    this.tippy?.destroy()
    this.element.removeEventListener('mousedown', this.mousedownHandler, { capture: true })
    this.editor.off('focus', this.focusHandler)
    this.editor.off('blur', this.blurHandler)
  }
}

export const FloatingMenuPlugin = (options: FloatingMenuPluginProps) => {
  return new Plugin({
    key:
      typeof options.pluginKey === 'string' ? new PluginKey(options.pluginKey) : options.pluginKey,
    view: view => new FloatingMenuView({ view, ...options }),
  })
}
