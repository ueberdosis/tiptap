import { Decoration, NodeView as ProseMirrorNodeView } from 'prosemirror-view'
import { NodeSelection } from 'prosemirror-state'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import { Editor as CoreEditor } from './Editor'
import { Node } from './Node'
import { NodeViewRendererProps } from './types'

interface NodeViewRendererOptions {
  stopEvent: ((event: Event) => boolean) | null,
  update: ((node: ProseMirrorNode, decorations: Decoration[]) => boolean) | null,
}

export class NodeView<Component, Editor extends CoreEditor = CoreEditor> implements ProseMirrorNodeView {

  component: Component

  editor: Editor

  extension: Node

  node: ProseMirrorNode

  decorations: Decoration[]

  getPos: any

  isDragging = false

  options: NodeViewRendererOptions = {
    stopEvent: null,
    update: null,
  }

  constructor(component: Component, props: NodeViewRendererProps, options?: Partial<NodeViewRendererOptions>) {
    this.component = component
    this.options = { ...this.options, ...options }
    this.editor = props.editor as Editor
    this.extension = props.extension
    this.node = props.node
    this.decorations = props.decorations
    this.getPos = props.getPos
    this.mount()
  }

  mount() {
    // eslint-disable-next-line
    return
  }

  get dom(): Element | null {
    return null
  }

  get contentDOM(): Element | null {
    return null
  }

  onDragStart(event: DragEvent) {
    if (!this.dom) {
      return
    }

    const { view } = this.editor
    const target = (event.target as HTMLElement)

    if (this.contentDOM?.contains(target)) {
      return
    }

    const domBox = this.dom.getBoundingClientRect()
    const handleBox = target.getBoundingClientRect()
    const x = handleBox.x - domBox.x + event.offsetX
    const y = handleBox.y - domBox.y + event.offsetY

    // sometimes `event.target` is not the `dom` element
    event.dataTransfer?.setDragImage(this.dom, x, y)

    const selection = NodeSelection.create(view.state.doc, this.getPos())
    const transaction = view.state.tr.setSelection(selection)

    view.dispatch(transaction)
  }

  stopEvent(event: Event) {
    if (!this.dom) {
      return false
    }

    if (typeof this.options.stopEvent === 'function') {
      return this.options.stopEvent(event)
    }

    const target = (event.target as HTMLElement)
    const isInElement = this.dom.contains(target) && !this.contentDOM?.contains(target)

    // any event from child nodes should be handled by ProseMirror
    if (!isInElement) {
      return false
    }

    const isInput = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(target.tagName)
      || target.isContentEditable

    // any input event within node views should be ignored by ProseMirror
    if (isInput) {
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
    const isDragEvent = event.type.startsWith('drag') || event.type === 'drop'

    // ProseMirror tries to drag selectable nodes
    // even if `draggable` is set to `false`
    // this fix prevents that
    if (!isDraggable && isSelectable && isDragEvent) {
      event.preventDefault()
    }

    if (isDraggable && isDragEvent && !isDragging) {
      event.preventDefault()
      return false
    }

    // we have to store that dragging started
    if (isDraggable && isEditable && !isDragging && isClickEvent) {
      const dragHandle = target.closest('[data-drag-handle]')
      const isValidDragHandle = dragHandle
        && (this.dom === dragHandle || (this.dom.contains(dragHandle)))

      if (isValidDragHandle) {
        this.isDragging = true

        document.addEventListener('dragend', () => {
          this.isDragging = false
        }, { once: true })

        document.addEventListener('mouseup', () => {
          this.isDragging = false
        }, { once: true })
      }
    }

    // these events are handled by prosemirror
    if (
      isDragging
      || isCopyEvent
      || isPasteEvent
      || isCutEvent
      || (isClickEvent && isSelectable)
    ) {
      return false
    }

    return true
  }

  ignoreMutation(mutation: MutationRecord | { type: 'selection', target: Element }) {
    if (mutation.type === 'selection') {
      if (this.node.isLeaf) {
        return true
      }

      return false
    }

    if (!this.contentDOM) {
      return true
    }

    const contentDOMHasChanged = !this.contentDOM.contains(mutation.target)
      || this.contentDOM === mutation.target

    return contentDOMHasChanged
  }

  updateAttributes(attributes: {}) {
    if (!this.editor.view.editable) {
      return
    }

    const { state } = this.editor.view
    const pos = this.getPos()
    const transaction = state.tr.setNodeMarkup(pos, undefined, {
      ...this.node.attrs,
      ...attributes,
    })

    this.editor.view.dispatch(transaction)
  }

}
