import { Editor, Node, NodeViewRendererProps } from '@tiptap/core'
import { Decoration, NodeView } from 'prosemirror-view'

import {
  Node as ProseMirrorNode,
} from 'prosemirror-model'
import Vue from 'vue'
import { VueConstructor } from 'vue/types/umd'

class VueNodeView implements NodeView {

  vm!: Vue

  editor: Editor

  extension!: Node

  node!: ProseMirrorNode

  decorations!: Decoration[]

  id!: string

  getPos!: any

  isDragging = false

  constructor(component: Vue | VueConstructor, props: NodeViewRendererProps) {
    this.editor = props.editor
    this.extension = props.extension
    this.node = props.node
    this.getPos = props.getPos
    this.createUniqueId()
    this.mount(component)
  }

  createUniqueId() {
    this.id = `id_${Math.floor(Math.random() * 0xFFFFFFFF)}`
  }

  createNodeViewWrapper() {
    return Vue.extend({
      props: {
        as: {
          type: String,
          default: 'div',
        },
      },
      render(createElement) {
        return createElement(
          this.as, {
            style: {
              whiteSpace: 'normal',
            },
          },
          this.$slots.default,
        )
      },
    })
  }

  createNodeViewContent() {
    const { id } = this

    return Vue.extend({
      inheritAttrs: false,
      props: {
        as: {
          type: String,
          default: 'div',
        },
      },
      render(createElement) {
        return createElement(
          this.as, {
            style: {
              whiteSpace: 'pre-wrap',
            },
            attrs: {
              id,
              contenteditable: true,
            },
          },
        )
      },
    })
  }

  mount(component: Vue | VueConstructor) {
    const NodeViewWrapper = this.createNodeViewWrapper()
    const NodeViewContent = this.createNodeViewContent()

    const Component = Vue
      .extend(component)
      .extend({
        components: {
          NodeViewWrapper,
          NodeViewContent,
        },
      })

    const props = {
      editor: this.editor,
      NodeViewWrapper,
      NodeViewContent,
      node: this.node,
      updateAttributes: (attrs: {}) => this.updateAttributes(attrs),
    }

    this.vm = new Component({
      // TODO: get parent component <editor-content>
      // parent: this.parent,
      propsData: props,
    }).$mount()
  }

  get dom() {
    return this.vm.$el
  }

  get contentDOM() {
    if (this.vm.$el.id === this.id) {
      return this.vm.$el
    }

    return this.vm.$el.querySelector(`#${this.id}`)
  }

  stopEvent(event: Event) {
    const isDraggable = this.node.type.spec.draggable
    const isCopyEvent = event.type === 'copy'
    const isPasteEvent = event.type === 'paste'
    const isCutEvent = event.type === 'cut'
    const isDragEvent = event.type.startsWith('drag') || event.type === 'drop'

    if (isDragEvent && !this.isDragging) {
      event.preventDefault()
    }

    if (isDraggable && !this.isDragging && event.type === 'mousedown') {
      const target = (event.target as HTMLElement)
      const dragHandle = target.closest('[data-drag-handle]')
      const isValidDragHandle = dragHandle
        && (this.dom === dragHandle || this.dom.contains(dragHandle))

      if (isValidDragHandle) {
        this.isDragging = true
        document.addEventListener('dragend', () => {
          this.isDragging = false
        }, { once: true })
      }
    }

    if (this.isDragging || isCopyEvent || isPasteEvent || isCutEvent) {
      return false
    }

    return true
  }

  ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element }) {
    if (mutation.type === 'selection') {
      return true
    }

    if (!this.contentDOM) {
      return true
    }

    const contentDOMHasChanged = !this.contentDOM.contains(mutation.target)
      || this.contentDOM === mutation.target

    return contentDOMHasChanged
  }

  update(node: ProseMirrorNode, decorations: Decoration[]) {
    if (node.type !== this.node.type) {
      return false
    }

    if (node === this.node && this.decorations === decorations) {
      return true
    }

    this.node = node
    this.decorations = decorations
    this.updateComponentProps()

    return true
  }

  updateComponentProps() {
    this.vm.$props.node = this.node
    this.vm.$props.decorations = this.decorations
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

export default function VueRenderer(component: Vue | VueConstructor) {
  return (props: NodeViewRendererProps) => new VueNodeView(component, props) as NodeView
}
