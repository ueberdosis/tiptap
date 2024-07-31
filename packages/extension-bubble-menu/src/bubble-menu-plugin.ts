import {
  type ArrowOptions,
  type AutoPlacementOptions,
  type FlipOptions,
  type HideOptions,
  type InlineOptions,
  type Middleware, type OffsetOptions, type Placement, type ShiftOptions, type SizeOptions, type Strategy, arrow, autoPlacement, computePosition, flip, hide, inline, offset, shift,
  size,
} from '@floating-ui/dom'
import {
  Editor, isTextSelection, posToDOMRect,
} from '@tiptap/core'
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'

export interface BubbleMenuPluginProps {
  /**
   * The plugin key.
   * @type {PluginKey | string}
   * @default 'bubbleMenu'
   */
  pluginKey: PluginKey | string

  /**
   * The editor instance.
   */
  editor: Editor

  /**
   * The DOM element that contains your menu.
   * @type {HTMLElement}
   * @default null
   */
  element: HTMLElement

  /**
   * The delay in milliseconds before the menu should be updated.
   * This can be useful to prevent performance issues.
   * @type {number}
   * @default 250
   */
  updateDelay?: number

  /**
   * The delay in milliseconds before the menu position should be updated on window resize.
   * This can be useful to prevent performance issues.
   * @type {number}
   * @default 60
   */
  resizeDelay?: number

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

export type BubbleMenuViewProps = BubbleMenuPluginProps & {
  view: EditorView
}

export class BubbleMenuView {
  public editor: Editor

  public element: HTMLElement

  public view: EditorView

  public preventHide = false

  public updateDelay: number

  public resizeDelay: number

  private updateDebounceTimer: number | undefined

  private resizeDebounceTimer: number | undefined

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
      placement: 'top',
      offset: 8,
      flip: {},
      shift: {},
      arrow: false,
      size: false,
      autoPlacement: false,
      hide: false,
      inline: false,
    }

  public shouldShow: Exclude<BubbleMenuPluginProps['shouldShow'], null> = ({
    view,
    state,
    from,
    to,
  }) => {
    const { doc, selection } = state
    const { empty } = selection

    // Sometime check for `empty` is not enough.
    // Doubleclick an empty paragraph returns a node size of 2.
    // So we check also for an empty text size.
    const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(state.selection)

    // When clicking on a element inside the bubble menu the editor "blur" event
    // is called and the bubble menu item is focussed. In this case we should
    // consider the menu as part of the editor and keep showing the menu
    const isChildOfMenu = this.element.contains(document.activeElement)

    const hasEditorFocus = view.hasFocus() || isChildOfMenu

    if (!hasEditorFocus || empty || isEmptyTextBlock || !this.editor.isEditable) {
      return false
    }

    return true
  }

  get middlewares() {
    const middlewares: Middleware[] = []

    if (this.floatingUIOptions.flip) {
      middlewares.push(flip(typeof this.floatingUIOptions.flip !== 'boolean' ? this.floatingUIOptions.flip : undefined))
    }

    if (this.floatingUIOptions.shift) {
      middlewares.push(shift(typeof this.floatingUIOptions.shift !== 'boolean' ? this.floatingUIOptions.shift : undefined))
    }

    if (this.floatingUIOptions.offset) {
      middlewares.push(offset(typeof this.floatingUIOptions.offset !== 'boolean' ? this.floatingUIOptions.offset : undefined))
    }

    if (this.floatingUIOptions.arrow) {
      middlewares.push(arrow(this.floatingUIOptions.arrow))
    }

    if (this.floatingUIOptions.size) {
      middlewares.push(size(typeof this.floatingUIOptions.size !== 'boolean' ? this.floatingUIOptions.size : undefined))
    }

    if (this.floatingUIOptions.autoPlacement) {
      middlewares.push(autoPlacement(typeof this.floatingUIOptions.autoPlacement !== 'boolean' ? this.floatingUIOptions.autoPlacement : undefined))
    }

    if (this.floatingUIOptions.hide) {
      middlewares.push(hide(typeof this.floatingUIOptions.hide !== 'boolean' ? this.floatingUIOptions.hide : undefined))
    }

    if (this.floatingUIOptions.inline) {
      middlewares.push(inline(typeof this.floatingUIOptions.inline !== 'boolean' ? this.floatingUIOptions.inline : undefined))
    }

    return middlewares
  }

  constructor({
    editor,
    element,
    view,
    updateDelay = 250,
    resizeDelay = 60,
    shouldShow,
    options,
  }: BubbleMenuViewProps) {
    this.editor = editor
    this.element = element
    this.view = view
    this.updateDelay = updateDelay
    this.resizeDelay = resizeDelay

    this.floatingUIOptions = {
      ...this.floatingUIOptions,
      ...options,
    }

    if (shouldShow) {
      this.shouldShow = shouldShow
    }

    this.element.addEventListener('mousedown', this.mousedownHandler, { capture: true })
    this.view.dom.addEventListener('dragstart', this.dragstartHandler)
    this.editor.on('focus', this.focusHandler)
    this.editor.on('blur', this.blurHandler)
    window.addEventListener('resize', () => {
      if (this.resizeDebounceTimer) {
        clearTimeout(this.resizeDebounceTimer)
      }

      this.resizeDebounceTimer = window.setTimeout(() => {
        this.updatePosition()
      }, this.resizeDelay)
    })

    this.update(view, view.state)

    if (this.getShouldShow()) {
      this.show()
    }
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

    computePosition(virtualElement, this.element, { placement: this.floatingUIOptions.placement, strategy: this.floatingUIOptions.strategy, middleware: this.middlewares }).then(({ x, y, strategy }) => {
      this.element.style.width = 'max-content'
      this.element.style.position = strategy
      this.element.style.left = `${x}px`
      this.element.style.top = `${y}px`
    })
  }

  update(view: EditorView, oldState?: EditorState) {
    const { state } = view
    const hasValidSelection = state.selection.from !== state.selection.to

    if (this.updateDelay > 0 && hasValidSelection) {
      this.handleDebouncedUpdate(view, oldState)
      return
    }

    const selectionChanged = !oldState?.selection.eq(view.state.selection)
    const docChanged = !oldState?.doc.eq(view.state.doc)

    this.updateHandler(view, selectionChanged, docChanged, oldState)
  }

  handleDebouncedUpdate = (view: EditorView, oldState?: EditorState) => {
    const selectionChanged = !oldState?.selection.eq(view.state.selection)
    const docChanged = !oldState?.doc.eq(view.state.doc)

    if (!selectionChanged && !docChanged) {
      return
    }

    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer)
    }

    this.updateDebounceTimer = window.setTimeout(() => {
      this.updateHandler(view, selectionChanged, docChanged, oldState)
    }, this.updateDelay)
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
    this.view.dom.removeEventListener('dragstart', this.dragstartHandler)
    this.editor.off('focus', this.focusHandler)
    this.editor.off('blur', this.blurHandler)
  }
}

export const BubbleMenuPlugin = (options: BubbleMenuPluginProps) => {
  return new Plugin({
    key:
      typeof options.pluginKey === 'string' ? new PluginKey(options.pluginKey) : options.pluginKey,
    view: view => new BubbleMenuView({ view, ...options }),
  })
}
