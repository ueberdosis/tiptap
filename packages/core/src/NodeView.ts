import { Decoration, NodeView as ProseMirrorNodeView } from 'prosemirror-view'
import { NodeSelection, Transaction } from 'prosemirror-state'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import { Editor as CoreEditor } from './Editor'
import { Node } from './Node'
import isiOS from './utilities/isiOS'
import minMax from './utilities/minMax'
import { NodeViewRendererProps } from './types'
import { NodeViewCacheItem } from './NodeViewCache'

interface NodeViewRendererOptions {
  stopEvent: ((event: Event) => boolean) | null,
  update: ((node: ProseMirrorNode, decorations: Decoration[]) => boolean) | null,
}

export type ExtendedNodeView = ProseMirrorNodeView & {
  /**
   * Called when the node view can be safely destroyed to provide a cache.
   */
  destroyed?: () => void
}

export class NodeView<Component, Editor extends CoreEditor = CoreEditor> implements ExtendedNodeView {

  component!: Component

  editor!: Editor

  extension!: Node

  node!: ProseMirrorNode

  decorations!: Decoration[]

  getPos: any

  isDragging = false

  options: NodeViewRendererOptions = {
    stopEvent: null,
    update: null,
  }

  position!: number

  deletedPosition!: boolean

  cache!: NodeViewCacheItem

  constructor(component: Component, props: NodeViewRendererProps, options?: Partial<NodeViewRendererOptions>) {
    this.component = component
    this.options = { ...this.options, ...options }
    this.editor = props.editor as Editor
    this.extension = props.extension
    this.node = props.node
    this.decorations = props.decorations
    this.getPos = props.getPos
    this.position = this.getPos()

    // console.log({
    //   cache: this.editor.nodeViewCache.data,
    // })

    const maybeReplace = this.editor.nodeViewCache.data.find(item => {
      const position = minMax(item.instance.getPos(), 0, this.editor.state.doc.content.size)

      // console.log('maybe pos', position, this.editor.state.doc.resolve(position))

      if (position) {
        console.log({
          // sameNode: this.editor.state.doc.nodeAt(position) === item.instance.node,
          // sameMarkup: this.editor.state.doc.nodeAt(position)?.sameMarkup(item.instance.node),
          position,
          same: item.instance.node === this.node,
          sameM: item.instance.node.sameMarkup(this.node),
        })
      }

      return item.instance.node === this.node
        && (!position || (this.editor.state.doc.nodeAt(position) !== item.instance.node && !this.editor.state.doc.nodeAt(position)?.sameMarkup(item.instance.node)))
      // && (!position || this.editor.state.doc.nodeAt(position) === item.instance.node)
      // && this.editor.state.doc.nodeAt(item.instance.getPos()) === item.instance.node
    })

    console.log({ maybeReplace })

    if (maybeReplace) {
      this.editor.nodeViewCache.remove(maybeReplace.id)

      // this.editor.nodeViewCache.add
      // maybeReplace.instance.node = this.node
      maybeReplace.instance.nope = true
      maybeReplace.instance.getPos = this.getPos
      maybeReplace.instance.cache = this.editor.nodeViewCache.add(maybeReplace.instance)

      console.log('new cache', this.editor.nodeViewCache.data)

      return maybeReplace.instance
    }

    // const cache = this.editor.nodeViewCache.findNodeAtPosition(this.node, this.position)

    // if (cache) {
    //   cache.instance.getPos = this.getPos
    //   return cache.instance
    // }

    // this.editor.on('beforeUpdateState', this.onBeforeUpdateState)

    this.mount()

    this.cache = this.editor.nodeViewCache.add(this)
  }

  // onBeforeUpdateState = ({ transaction }: { transaction: Transaction }) => {
  //   if (!transaction.docChanged) {
  //     return
  //   }

  //   console.log({ transaction })

  //   const mapResult = transaction.mapping.mapResult(this.position)
  //   const newPosition = mapResult.pos
  //   // const newNode = transaction.doc.nodeAt(newPosition)

  //   this.deletedPosition = mapResult.deleted
  //     // prevents an error when replacing a node with itself
  //     || transaction.getMeta('uiEvent') === 'paste'
  //     // prevents an error when replacing a node with itself
  //     || transaction.getMeta('uiEvent') === 'drop'

  //   // console.log({
  //   //   transaction,
  //   //   oldPosition: this.position,
  //   //   newPosition,
  //   //   newNode,
  //   //   oldNode: this.node,
  //   //   cache: this.editor.nodeViewCache.data,
  //   // })

  //   this.position = newPosition
  // }

  mount() {
    // eslint-disable-next-line
    return
  }

  destroy() {
    // if (this.deletedPosition) {
    //   this.editor.nodeViewCache.remove(this.cache.id)
    //   this.editor.off('beforeUpdateState', this.onBeforeUpdateState)
    //   this.destroyed()
    // }

    // const id = this.cache.id
    // setTimeout(() => {

    //   // this.editor.nodeViewCache.remove(this.cache.id)
    //   // this.editor.off('beforeUpdateState', this.onBeforeUpdateState)

    //   if (this.editor.nodeViewCache.get(id)) {
    //     console.log('SHOULD DELETE')
    //     this.editor.nodeViewCache.remove(id)
    //     this.destroyed()
    //   }
    // })

    // @ts-ignore
    // console.log('delete1', this.nope)

    // const id = this.cache.id
    setTimeout(() => {

      // @ts-ignore
      // console.log('delete2', this.nope)

      // @ts-ignore
      if (this.nope) {
        // @ts-ignore
        this.nope = false

        return
      }

      this.editor.nodeViewCache.remove(this.cache.id)
      this.destroyed()

      // this.editor.nodeViewCache.remove(this.cache.id)
      // this.editor.off('beforeUpdateState', this.onBeforeUpdateState)

      // console.log('delete2', this.getPos())

      // if (this.editor.nodeViewCache.get(id)) {
      //   console.log('SHOULD DELETE')
      //   this.editor.nodeViewCache.remove(id)
      //   this.destroyed()
      // }
    })
  }

  destroyed() {
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
    const { view } = this.editor
    const target = (event.target as HTMLElement)

    // get the drag handle element
    // `closest` is not available for text nodes so we may have to use its parent
    const dragHandle = target.nodeType === 3
      ? target.parentElement?.closest('[data-drag-handle]')
      : target.closest('[data-drag-handle]')

    if (
      !this.dom
      || this.contentDOM?.contains(target)
      || !dragHandle
    ) {
      return
    }

    let x = 0
    let y = 0

    // calculate offset for drag element if we use a different drag handle element
    if (this.dom !== dragHandle) {
      const domBox = this.dom.getBoundingClientRect()
      const handleBox = dragHandle.getBoundingClientRect()

      x = handleBox.x - domBox.x + event.offsetX
      y = handleBox.y - domBox.y + event.offsetY
    }

    event.dataTransfer?.setDragImage(this.dom, x, y)

    // we need to tell ProseMirror that we want to move the whole node
    // so we create a NodeSelection
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
    if (!this.dom || !this.contentDOM) {
      return true
    }

    // a leaf/atom node is like a black box for ProseMirror
    // and should be fully handled by the node view
    if (this.node.isLeaf) {
      return true
    }

    // ProseMirror should handle any selections
    if (mutation.type === 'selection') {
      return false
    }

    // try to prevent a bug on iOS that will break node views on enter
    // this is because ProseMirror can’t preventDispatch on enter
    // this will lead to a re-render of the node view on enter
    // see: https://github.com/ueberdosis/tiptap/issues/1214
    if (this.dom.contains(mutation.target) && mutation.type === 'childList' && isiOS()) {
      const changedNodes = [
        ...Array.from(mutation.addedNodes),
        ...Array.from(mutation.removedNodes),
      ] as HTMLElement[]

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
