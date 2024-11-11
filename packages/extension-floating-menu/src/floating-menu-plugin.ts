import {
  type ArrowOptions,
  type AutoPlacementOptions,
  type FlipOptions,
  type HideOptions,
  type InlineOptions,
  type Middleware,
  type OffsetOptions,
  type Placement,
  type ShiftOptions,
  type SizeOptions,
  type Strategy,
  arrow,
  autoPlacement,
  computePosition,
  flip,
  hide,
  inline,
  offset,
  shift,
  size,
} from '@floating-ui/dom'
import { Editor, posToDOMRect } from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'

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
   * A function that determines whether the menu should be shown or not.
   * If this function returns `false`, the menu will be hidden, otherwise it will be shown.
   */
  shouldShow:
    | ((props: {
        editor: Editor
        view: EditorView
        state: EditorState
        oldState?: EditorState
        from: number
        to: number
      }) => boolean)
    | null

  /**
   * FloatingUI options.
   */
  options?: {
    strategy?: Strategy
    placement?: Placement
    offset?: OffsetOptions | boolean
    flip?: FlipOptions | boolean
    shift?: ShiftOptions | boolean
    arrow?: ArrowOptions | false
    size?: SizeOptions | boolean
    autoPlacement?: AutoPlacementOptions | boolean
    hide?: HideOptions | boolean
    inline?: InlineOptions | boolean
  }
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

  public shouldShow: Exclude<FloatingMenuPluginProps['shouldShow'], null> = ({ view, state }) => {
    const { selection } = state
    const { $anchor, empty } = selection
    const isRootDepth = $anchor.depth === 1
    const isEmptyTextBlock = $anchor.parent.isTextblock && !$anchor.parent.type.spec.code && !$anchor.parent.textContent

    if (!view.hasFocus() || !empty || !isRootDepth || !isEmptyTextBlock || !this.editor.isEditable) {
      return false
    }

    return true
  }

  private floatingUIOptions: {
    strategy: Strategy
    placement: Placement
    offset: OffsetOptions | boolean
    flip: FlipOptions | boolean
    shift: ShiftOptions | boolean
    arrow: ArrowOptions | false
    size: SizeOptions | boolean
    autoPlacement: AutoPlacementOptions | boolean
    hide: HideOptions | boolean
    inline: InlineOptions | boolean
  } = {
    strategy: 'absolute',
    placement: 'right',
    offset: 8,
    flip: {},
    shift: {},
    arrow: false,
    size: false,
    autoPlacement: false,
    hide: false,
    inline: false,
  }

  get middlewares() {
    const middlewares: Middleware[] = []

    if (this.floatingUIOptions.flip) {
      middlewares.push(flip(typeof this.floatingUIOptions.flip !== 'boolean' ? this.floatingUIOptions.flip : undefined))
    }

    if (this.floatingUIOptions.shift) {
      middlewares.push(
        shift(typeof this.floatingUIOptions.shift !== 'boolean' ? this.floatingUIOptions.shift : undefined),
      )
    }

    if (this.floatingUIOptions.offset) {
      middlewares.push(
        offset(typeof this.floatingUIOptions.offset !== 'boolean' ? this.floatingUIOptions.offset : undefined),
      )
    }

    if (this.floatingUIOptions.arrow) {
      middlewares.push(arrow(this.floatingUIOptions.arrow))
    }

    if (this.floatingUIOptions.size) {
      middlewares.push(size(typeof this.floatingUIOptions.size !== 'boolean' ? this.floatingUIOptions.size : undefined))
    }

    if (this.floatingUIOptions.autoPlacement) {
      middlewares.push(
        autoPlacement(
          typeof this.floatingUIOptions.autoPlacement !== 'boolean' ? this.floatingUIOptions.autoPlacement : undefined,
        ),
      )
    }

    if (this.floatingUIOptions.hide) {
      middlewares.push(hide(typeof this.floatingUIOptions.hide !== 'boolean' ? this.floatingUIOptions.hide : undefined))
    }

    if (this.floatingUIOptions.inline) {
      middlewares.push(
        inline(typeof this.floatingUIOptions.inline !== 'boolean' ? this.floatingUIOptions.inline : undefined),
      )
    }

    return middlewares
  }

  constructor({ editor, element, view, options, shouldShow }: FloatingMenuViewProps) {
    this.editor = editor
    this.element = element
    this.view = view

    this.floatingUIOptions = {
      ...this.floatingUIOptions,
      ...options,
    }

    if (shouldShow) {
      this.shouldShow = shouldShow
    }

    this.element.addEventListener('mousedown', this.mousedownHandler, { capture: true })
    this.editor.on('focus', this.focusHandler)
    this.editor.on('blur', this.blurHandler)

    this.update(view, view.state)

    if (this.getShouldShow()) {
      this.show()
    }
  }

  getShouldShow(oldState?: EditorState) {
    const { state } = this.view
    const { selection } = state

    const { ranges } = selection
    const from = Math.min(...ranges.map(range => range.$from.pos))
    const to = Math.max(...ranges.map(range => range.$to.pos))

    const shouldShow = this.shouldShow?.({
      editor: this.editor,
      view: this.view,
      state,
      oldState,
      from,
      to,
    })

    return shouldShow
  }

  updateHandler = (view: EditorView, selectionChanged: boolean, docChanged: boolean, oldState?: EditorState) => {
    const { composing } = view

    const isSame = !selectionChanged && !docChanged

    if (composing || isSame) {
      return
    }

    const shouldShow = this.getShouldShow(oldState)

    if (!shouldShow) {
      this.hide()

      return
    }

    this.updatePosition()
    this.show()
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

    this.hide()
  }

  updatePosition() {
    const { selection } = this.editor.state

    const virtualElement = {
      getBoundingClientRect: () => posToDOMRect(this.view, selection.from, selection.to),
    }

    computePosition(virtualElement, this.element, {
      placement: this.floatingUIOptions.placement,
      strategy: this.floatingUIOptions.strategy,
      middleware: this.middlewares,
    }).then(({ x, y, strategy }) => {
      this.element.style.width = 'max-content'
      this.element.style.position = strategy
      this.element.style.left = `${x}px`
      this.element.style.top = `${y}px`
    })
  }

  update(view: EditorView, oldState?: EditorState) {
    const selectionChanged = !oldState?.selection.eq(view.state.selection)
    const docChanged = !oldState?.doc.eq(view.state.doc)

    this.updateHandler(view, selectionChanged, docChanged, oldState)
  }

  show() {
    this.element.style.visibility = 'visible'
    this.element.style.opacity = '1'
    // attach from body
    document.body.appendChild(this.element)
  }

  hide() {
    this.element.style.visibility = 'hidden'
    this.element.style.opacity = '0'
    // remove from body
    this.element.remove()
  }

  destroy() {
    this.hide()
    this.element.removeEventListener('mousedown', this.mousedownHandler, { capture: true })
    this.editor.off('focus', this.focusHandler)
    this.editor.off('blur', this.blurHandler)
  }
}

export const FloatingMenuPlugin = (options: FloatingMenuPluginProps) => {
  return new Plugin({
    key: typeof options.pluginKey === 'string' ? new PluginKey(options.pluginKey) : options.pluginKey,
    view: view => new FloatingMenuView({ view, ...options }),
  })
}
