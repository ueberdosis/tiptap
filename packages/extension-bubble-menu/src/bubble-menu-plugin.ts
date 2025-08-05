import {
  type Middleware,
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
import type { Editor } from '@tiptap/core'
import { isTextSelection, posToDOMRect } from '@tiptap/core'
import type { EditorState, PluginView } from '@tiptap/pm/state'
import { NodeSelection, Plugin, PluginKey } from '@tiptap/pm/state'
import { CellSelection } from '@tiptap/pm/tables'
import type { EditorView } from '@tiptap/pm/view'

function combineDOMRects(rect1: DOMRect, rect2: DOMRect): DOMRect {
  const top = Math.min(rect1.top, rect2.top)
  const bottom = Math.max(rect1.bottom, rect2.bottom)
  const left = Math.min(rect1.left, rect2.left)
  const right = Math.max(rect1.right, rect2.right)
  const width = right - left
  const height = bottom - top
  const x = left
  const y = top
  return new DOMRect(x, y, width, height)
}

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
  shouldShow?:
    | ((props: {
        editor: Editor
        element: HTMLElement
        view: EditorView
        state: EditorState
        oldState?: EditorState
        from: number
        to: number
      }) => boolean)
    | null

  /**
   * The DOM element to append your menu to. Default is the editor's parent element.
   *
   * Sometimes the menu needs to be appended to a different DOM context due to accessibility, clipping, or z-index issues.
   *
   * @type {HTMLElement}
   * @default null
   */
  appendTo?: HTMLElement

  /**
   * The options for the bubble menu. Those are passed to Floating UI and include options for the placement, offset, flip, shift, arrow, size, autoPlacement,
   * hide, and inline middlewares.
   * @default {}
   * @see https://floating-ui.com/docs/computePosition#options
   */
  options?: {
    strategy?: 'absolute' | 'fixed'
    placement?:
      | 'top'
      | 'right'
      | 'bottom'
      | 'left'
      | 'top-start'
      | 'top-end'
      | 'right-start'
      | 'right-end'
      | 'bottom-start'
      | 'bottom-end'
      | 'left-start'
      | 'left-end'
    offset?: Parameters<typeof offset>[0] | boolean
    flip?: Parameters<typeof flip>[0] | boolean
    shift?: Parameters<typeof shift>[0] | boolean
    arrow?: Parameters<typeof arrow>[0] | false
    size?: Parameters<typeof size>[0] | boolean
    autoPlacement?: Parameters<typeof autoPlacement>[0] | boolean
    hide?: Parameters<typeof hide>[0] | boolean
    inline?: Parameters<typeof inline>[0] | boolean

    onShow?: () => void
    onHide?: () => void
    onUpdate?: () => void
    onDestroy?: () => void
  }
}

export type BubbleMenuViewProps = BubbleMenuPluginProps & {
  view: EditorView
}

export class BubbleMenuView implements PluginView {
  public editor: Editor

  public element: HTMLElement

  public view: EditorView

  public preventHide = false

  public updateDelay: number

  public resizeDelay: number

  public appendTo: HTMLElement | undefined

  private updateDebounceTimer: number | undefined

  private resizeDebounceTimer: number | undefined

  private isVisible = false

  private floatingUIOptions: NonNullable<BubbleMenuPluginProps['options']> = {
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
    onShow: undefined,
    onHide: undefined,
    onUpdate: undefined,
    onDestroy: undefined,
  }

  public shouldShow: Exclude<BubbleMenuPluginProps['shouldShow'], null> = ({ view, state, from, to }) => {
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

  constructor({
    editor,
    element,
    view,
    updateDelay = 250,
    resizeDelay = 60,
    shouldShow,
    appendTo,
    options,
  }: BubbleMenuViewProps) {
    this.editor = editor
    this.element = element
    this.view = view
    this.updateDelay = updateDelay
    this.resizeDelay = resizeDelay
    this.appendTo = appendTo

    this.floatingUIOptions = {
      ...this.floatingUIOptions,
      ...options,
    }

    this.element.tabIndex = 0

    if (shouldShow) {
      this.shouldShow = shouldShow
    }

    this.element.addEventListener('mousedown', this.mousedownHandler, { capture: true })
    this.view.dom.addEventListener('dragstart', this.dragstartHandler)
    this.editor.on('focus', this.focusHandler)
    this.editor.on('blur', this.blurHandler)
    window.addEventListener('resize', this.resizeHandler)

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

  /**
   * Handles the window resize event to update the position of the bubble menu.
   * It uses a debounce mechanism to prevent excessive updates.
   * The delay is defined by the `resizeDelay` property.
   */
  resizeHandler = () => {
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer)
    }

    this.resizeDebounceTimer = window.setTimeout(() => {
      this.updatePosition()
    }, this.resizeDelay)
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

    if (event?.relatedTarget === this.editor.view.dom) {
      return
    }

    this.hide()
  }

  updatePosition() {
    const { selection } = this.editor.state
    const domRect = posToDOMRect(this.view, selection.from, selection.to)
    let virtualElement = {
      getBoundingClientRect: () => domRect,
      getClientRects: () => [domRect],
    }

    if (selection instanceof NodeSelection) {
      let node = this.view.nodeDOM(selection.from) as HTMLElement

      const nodeViewWrapper = node.dataset.nodeViewWrapper ? node : node.querySelector('[data-node-view-wrapper]')

      if (nodeViewWrapper) {
        node = nodeViewWrapper as HTMLElement
      }

      if (node) {
        virtualElement = {
          getBoundingClientRect: () => node.getBoundingClientRect(),
          getClientRects: () => [node.getBoundingClientRect()],
        }
      }
    }

    // this is a special case for cell selections
    if (selection instanceof CellSelection) {
      const { $anchorCell, $headCell } = selection

      const from = $anchorCell ? $anchorCell.pos : $headCell!.pos
      const to = $headCell ? $headCell.pos : $anchorCell!.pos

      const fromDOM = this.view.nodeDOM(from)
      const toDOM = this.view.nodeDOM(to)

      if (!fromDOM || !toDOM) {
        return
      }

      const clientRect =
        fromDOM === toDOM
          ? (fromDOM as HTMLElement).getBoundingClientRect()
          : combineDOMRects(
              (fromDOM as HTMLElement).getBoundingClientRect(),
              (toDOM as HTMLElement).getBoundingClientRect(),
            )

      virtualElement = {
        getBoundingClientRect: () => clientRect,
        getClientRects: () => [clientRect],
      }
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

      if (this.isVisible && this.floatingUIOptions.onUpdate) {
        this.floatingUIOptions.onUpdate()
      }
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

    // support for CellSelections
    const { ranges } = selection
    const from = Math.min(...ranges.map(range => range.$from.pos))
    const to = Math.max(...ranges.map(range => range.$to.pos))

    const shouldShow = this.shouldShow?.({
      editor: this.editor,
      element: this.element,
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
    if (this.isVisible) {
      return
    }

    this.element.style.visibility = 'visible'
    this.element.style.opacity = '1'
    // attach to appendTo or editor's parent element
    ;(this.appendTo ?? this.view.dom.parentElement)?.appendChild(this.element)

    if (this.floatingUIOptions.onShow) {
      this.floatingUIOptions.onShow()
    }

    this.isVisible = true
  }

  hide() {
    if (!this.isVisible) {
      return
    }

    this.element.style.visibility = 'hidden'
    this.element.style.opacity = '0'
    // remove from the parent element
    this.element.remove()

    if (this.floatingUIOptions.onHide) {
      this.floatingUIOptions.onHide()
    }

    this.isVisible = false
  }

  destroy() {
    this.hide()
    this.element.removeEventListener('mousedown', this.mousedownHandler, { capture: true })
    this.view.dom.removeEventListener('dragstart', this.dragstartHandler)
    window.removeEventListener('resize', this.resizeHandler)
    this.editor.off('focus', this.focusHandler)
    this.editor.off('blur', this.blurHandler)

    if (this.floatingUIOptions.onDestroy) {
      this.floatingUIOptions.onDestroy()
    }
  }
}

export const BubbleMenuPlugin = (options: BubbleMenuPluginProps) => {
  return new Plugin({
    key: typeof options.pluginKey === 'string' ? new PluginKey(options.pluginKey) : options.pluginKey,
    view: view => new BubbleMenuView({ view, ...options }),
  })
}
