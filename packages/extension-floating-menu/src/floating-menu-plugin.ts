import { Editor, isNodeEmpty, posToClientRect } from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import tippy from 'tippy.js'

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

  public preventHide = false

  public tippy: any = null

  constructor({ editor, element, view }: FloatingMenuViewProps) {
    this.editor = editor
    this.element = element
    this.view = view
    // this.element.addEventListener('mousedown', this.mousedownHandler, { capture: true })
    // this.editor.on('focus', this.focusHandler)
    // this.editor.on('blur', this.blurHandler)
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
    console.log('blur')
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
      duration: 0,
      getReferenceClientRect: null,
      appendTo: () => document.body,
      content: this.element,
      interactive: true,
      trigger: 'manual',
      placement: 'right',
      // hideOnClick: 'toggle',
    })
  }

  update(view: EditorView, oldState?: EditorState) {
    const { state, composing } = view
    const { doc, selection } = state
    const isSame = oldState && oldState.doc.eq(doc) && oldState.selection.eq(selection)

    if (composing || isSame) {
      return
    }

    const {
      $anchor,
      empty,
      from,
      to,
    } = selection
    const isRootDepth = $anchor.depth === 1
    const isDefaultNodeType = $anchor.parent.type === state.doc.type.contentMatch.defaultType
    const isDefaultNodeEmpty = isNodeEmpty(selection.$anchor.parent)
    const isActive = isRootDepth && isDefaultNodeType && isDefaultNodeEmpty

    if (!empty || !isActive) {
      this.hide()

      return
    }

    this.tippy[0].setProps({
      getReferenceClientRect: () => posToClientRect(view, from, to),
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

export const FloatingMenuPluginKey = new PluginKey('menuFloating')

export const FloatingMenuPlugin = (options: FloatingMenuPluginProps) => {
  return new Plugin({
    key: FloatingMenuPluginKey,
    view: view => new FloatingMenuView({ view, ...options }),
  })
}
