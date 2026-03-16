import { NodeSelection } from '@tiptap/pm/state'
import type { NodeView as ProseMirrorNodeView, ViewMutationRecord } from '@tiptap/pm/view'

import type { Editor as CoreEditor } from './Editor.js'
import type { DecorationWithType, NodeViewRendererOptions, NodeViewRendererProps } from './types.js'
import { isAndroid } from './utilities/isAndroid.js'
import { isiOS } from './utilities/isiOS.js'

/**
 * Node views are used to customize the rendered DOM structure of a node.
 * @see https://tiptap.dev/guide/node-views
 */
export class NodeView<
  Component,
  NodeEditor extends CoreEditor = CoreEditor,
  Options extends NodeViewRendererOptions = NodeViewRendererOptions,
> implements ProseMirrorNodeView
{
  component: Component

  editor: NodeEditor

  options: Options

  extension: NodeViewRendererProps['extension']

  node: NodeViewRendererProps['node']

  decorations: NodeViewRendererProps['decorations']

  innerDecorations: NodeViewRendererProps['innerDecorations']

  view: NodeViewRendererProps['view']

  getPos: NodeViewRendererProps['getPos']

  HTMLAttributes: NodeViewRendererProps['HTMLAttributes']

  isDragging = false

  constructor(component: Component, props: NodeViewRendererProps, options?: Partial<Options>) {
    this.component = component
    this.editor = props.editor as NodeEditor
    this.options = {
      stopEvent: null,
      ignoreMutation: null,
      ...options,
    } as Options
    this.extension = props.extension
    this.node = props.node
    this.decorations = props.decorations as DecorationWithType[]
    this.innerDecorations = props.innerDecorations
    this.view = props.view
    this.HTMLAttributes = props.HTMLAttributes
    this.getPos = props.getPos
    this.mount()
  }

  mount() {
    // eslint-disable-next-line
    return
  }

  get dom(): HTMLElement {
    return this.editor.view.dom as HTMLElement
  }

  get contentDOM(): HTMLElement | null {
    return null
  }

  onDragStart(event: DragEvent) {
    const { view } = this.editor
    const target = event.target as HTMLElement

    // get the drag handle element
    // `closest` is not available for text nodes so we may have to use its parent
    const dragHandle =
      target.nodeType === 3 ? target.parentElement?.closest('[data-drag-handle]') : target.closest('[data-drag-handle]')

    if (!this.dom || this.contentDOM?.contains(target) || !dragHandle) {
      return
    }

    let x = 0
    let y = 0

    // calculate offset for drag element if we use a different drag handle element
    if (this.dom !== dragHandle) {
      const domBox = this.dom.getBoundingClientRect()
      const handleBox = dragHandle.getBoundingClientRect()

      // In React, we have to go through nativeEvent to reach offsetX/offsetY.
      const offsetX = event.offsetX ?? (event as any).nativeEvent?.offsetX
      const offsetY = event.offsetY ?? (event as any).nativeEvent?.offsetY

      x = handleBox.x - domBox.x + offsetX
      y = handleBox.y - domBox.y + offsetY
    }

    const clonedNode = this.dom.cloneNode(true) as HTMLElement

    // Preserve the visual size of the original when using the clone as
    // the drag image.
    try {
      const domBox = this.dom.getBoundingClientRect()
      clonedNode.style.width = `${Math.round(domBox.width)}px`
      clonedNode.style.height = `${Math.round(domBox.height)}px`
      clonedNode.style.boxSizing = 'border-box'
      // Ensure the clone doesn't capture pointer events while offscreen
      clonedNode.style.pointerEvents = 'none'
    } catch {
      // ignore measurement errors (e.g. if element not in DOM)
    }

    // Some browsers (notably Safari) require the element passed to
    // setDragImage to be present in the DOM. Using a detached node can
    // cause the drag to immediately end.
    let dragImageWrapper: HTMLElement | null = null

    try {
      dragImageWrapper = document.createElement('div')
      dragImageWrapper.style.position = 'absolute'
      dragImageWrapper.style.top = '-9999px'
      dragImageWrapper.style.left = '-9999px'
      dragImageWrapper.style.pointerEvents = 'none'
      dragImageWrapper.appendChild(clonedNode)
      document.body.appendChild(dragImageWrapper)

      event.dataTransfer?.setDragImage(clonedNode, x, y)
    } finally {
      // Remove the wrapper on the next tick so the browser can use the
      // element as the drag image. A 0ms timeout is enough in practice.
      if (dragImageWrapper) {
        setTimeout(() => {
          try {
            dragImageWrapper?.remove()
          } catch {
            // ignore removal errors
          }
        }, 0)
      }
    }

    const pos = this.getPos()

    if (typeof pos !== 'number') {
      return
    }
    // we need to tell ProseMirror that we want to move the whole node
    // so we create a NodeSelection
    const selection = NodeSelection.create(view.state.doc, pos)
    const transaction = view.state.tr.setSelection(selection)

    view.dispatch(transaction)
  }

  stopEvent(event: Event) {
    if (!this.dom) {
      return false
    }

    if (typeof this.options.stopEvent === 'function') {
      return this.options.stopEvent({ event })
    }

    const target = event.target as HTMLElement
    const isInElement = this.dom.contains(target) && !this.contentDOM?.contains(target)

    // any event from child nodes should be handled by ProseMirror
    if (!isInElement) {
      return false
    }

    const isDragEvent = event.type.startsWith('drag')
    const isDropEvent = event.type === 'drop'
    const isInput = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable

    // any input event within node views should be ignored by ProseMirror
    if (isInput && !isDropEvent && !isDragEvent) {
      return true
    }

    const { isEditable } = this.editor
    const { isDragging } = this
    const isDraggable = !!this.node.type.spec.draggable
    const isSelectable = NodeSelection.isSelectable(this.node)
    const isCopyEvent = event.type === 'copy'
    const isPasteEvent = event.type === 'paste'
    const isCutEvent = event.type === 'cut'
    const isClickEvent = event.type === 'mousedown'

    // ProseMirror tries to drag selectable nodes
    // even if `draggable` is set to `false`
    // this fix prevents that
    if (!isDraggable && isSelectable && isDragEvent && event.target === this.dom) {
      event.preventDefault()
    }

    if (isDraggable && isDragEvent && !isDragging && event.target === this.dom) {
      event.preventDefault()
      return false
    }

    // we have to store that dragging started
    if (isDraggable && isEditable && !isDragging && isClickEvent) {
      const dragHandle = target.closest('[data-drag-handle]')
      const isValidDragHandle = dragHandle && (this.dom === dragHandle || this.dom.contains(dragHandle))

      if (isValidDragHandle) {
        this.isDragging = true

        document.addEventListener(
          'dragend',
          () => {
            this.isDragging = false
          },
          { once: true },
        )

        document.addEventListener(
          'drop',
          () => {
            this.isDragging = false
          },
          { once: true },
        )

        document.addEventListener(
          'mouseup',
          () => {
            this.isDragging = false
          },
          { once: true },
        )
      }
    }

    // these events are handled by prosemirror
    if (isDragging || isDropEvent || isCopyEvent || isPasteEvent || isCutEvent || (isClickEvent && isSelectable)) {
      return false
    }

    return true
  }

  /**
   * Called when a DOM [mutation](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) or a selection change happens within the view.
   * @return `false` if the editor should re-read the selection or re-parse the range around the mutation
   * @return `true` if it can safely be ignored.
   */
  ignoreMutation(mutation: ViewMutationRecord) {
    if (!this.dom || !this.contentDOM) {
      return true
    }

    if (typeof this.options.ignoreMutation === 'function') {
      return this.options.ignoreMutation({ mutation })
    }

    // a leaf/atom node is like a black box for ProseMirror
    // and should be fully handled by the node view
    if (this.node.isLeaf || this.node.isAtom) {
      return true
    }

    // ProseMirror should handle any selections
    if (mutation.type === 'selection') {
      return false
    }

    // try to prevent a bug on iOS and Android that will break node views on enter
    // this is because ProseMirror can’t preventDispatch on enter
    // this will lead to a re-render of the node view on enter
    // see: https://github.com/ueberdosis/tiptap/issues/1214
    // see: https://github.com/ueberdosis/tiptap/issues/2534
    if (
      this.dom.contains(mutation.target) &&
      mutation.type === 'childList' &&
      (isiOS() || isAndroid()) &&
      this.editor.isFocused
    ) {
      const changedNodes = [...Array.from(mutation.addedNodes), ...Array.from(mutation.removedNodes)] as HTMLElement[]

      // we’ll check if every changed node is contentEditable
      // to make sure it’s probably mutated by ProseMirror
      if (changedNodes.every(node => node.isContentEditable)) {
        return false
      }
    }

    // we will allow mutation contentDOM with attributes
    // so we can for example adding classes within our node view
    if (this.contentDOM === mutation.target && mutation.type === 'attributes') {
      return true
    }

    // ProseMirror should handle any changes within contentDOM
    if (this.contentDOM.contains(mutation.target)) {
      return false
    }

    return true
  }

  /**
   * Update the attributes of the prosemirror node.
   */
  updateAttributes(attributes: Record<string, any>): void {
    this.editor.commands.command(({ tr }) => {
      const pos = this.getPos()

      if (typeof pos !== 'number') {
        return false
      }

      tr.setNodeMarkup(pos, undefined, {
        ...this.node.attrs,
        ...attributes,
      })

      return true
    })
  }

  /**
   * Delete the node.
   */
  deleteNode(): void {
    const from = this.getPos()

    if (typeof from !== 'number') {
      return
    }
    const to = from + this.node.nodeSize

    this.editor.commands.deleteRange({ from, to })
  }
}
