// @ts-nocheck
import { Node, NodeViewRenderer, NodeViewRendererProps } from '@tiptap/core'
import { Decoration, NodeView } from 'prosemirror-view'
import { NodeSelection } from 'prosemirror-state'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import React from 'react'
import ReactDOM from 'react-dom'
import { Editor } from './Editor'
import { ReactRenderer } from './ReactRenderer'

interface ReactNodeViewRendererOptions {
  stopEvent: ((event: Event) => boolean) | null,
  update: ((node: ProseMirrorNode, decorations: Decoration[]) => boolean) | null,
}

class ReactNodeView implements NodeView {

  renderer!: ReactRenderer

  editor: Editor

  extension!: Node

  node!: ProseMirrorNode

  decorations!: Decoration[]

  getPos!: any

  isDragging = false

  options: ReactNodeViewRendererOptions = {
    stopEvent: null,
    update: null,
  }

  constructor(component: any, props: NodeViewRendererProps, options?: Partial<ReactNodeViewRendererOptions>) {
    this.options = { ...this.options, ...options }
    this.editor = props.editor as Editor
    this.extension = props.extension
    this.node = props.node
    this.getPos = props.getPos
    this.mount(component)
  }

  mount(component: any) {
    const props = {}

    if (!component.displayName) {
      component.displayName = this.extension.config.name
    }

    this.renderer = new ReactRenderer(component, {
      editor: this.editor,
      props,
    })
  }

  get dom() {
    // if (!this.renderer.element) {
    //   return null
    // }

    // if (!this.renderer.element.hasAttribute('data-node-view-wrapper')) {
    //   throw Error('Please use the NodeViewWrapper component for your node view.')
    // }

    return this.renderer.element
  }

  get contentDOM() {
    // console.log(this.dom)
    // return null
    // if (!this.renderer.element) {
    //   return null
    // }

    const hasContent = !this.node.type.isAtom

    if (!hasContent) {
      return null
    }

    const contentElement = this.dom.querySelector('[data-node-view-content]')

    return contentElement || this.dom
  }

  stopEvent(event: Event) {
    if (typeof this.options.stopEvent === 'function') {
      return this.options.stopEvent(event)
    }

    const target = (event.target as HTMLElement)
    const isInElement = this.dom.contains(target) && !this.contentDOM?.contains(target)

    // ignore all events from child nodes
    if (!isInElement) {
      return false
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

  ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element }) {
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

  destroy() {
    this.renderer.destroy()
  }

  update(node: ProseMirrorNode, decorations: Decoration[]) {
    if (typeof this.options.update === 'function') {
      return this.options.update(node, decorations)
    }

    if (node.type !== this.node.type) {
      return false
    }

    if (node === this.node && this.decorations === decorations) {
      return true
    }

    this.node = node
    this.decorations = decorations
    // this.renderer.updateProps({ node, decorations })
    this.renderer.render()

    return true
  }
}

export function ReactNodeViewRenderer(component: any, options?: Partial<ReactNodeViewRendererOptions>): NodeViewRenderer {
  return (props: NodeViewRendererProps) => {
    // try to get the parent component
    // this is important for vue devtools to show the component hierarchy correctly
    // maybe it’s `undefined` because <editor-content> isn’t rendered yet
    if (!(props.editor as Editor).contentComponent) {
      return {}
    }

    return new ReactNodeView(component, props, options) as NodeView
  }
}
