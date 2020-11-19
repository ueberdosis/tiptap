import { Editor, Node, NodeViewRendererProps } from '@tiptap/core'
import { NodeView } from 'prosemirror-view'

import {
  Node as ProseMirrorNode,
} from 'prosemirror-model'
import Vue from 'vue'
import { VueConstructor } from 'vue/types/umd'
// import Inner from './components/Inner.vue'

// const Inner = Vue.extend()

class VueNodeView implements NodeView {

  vm!: Vue

  editor: Editor

  extension!: Node

  node!: ProseMirrorNode

  id!: string

  constructor(component: Vue | VueConstructor, props: NodeViewRendererProps) {
    // eslint-disable-next-line
    const { node, editor, getPos } = props
    // eslint-disable-next-line
    const { view } = editor

    this.editor = props.editor
    this.extension = props.extension
    this.node = props.node

    this.mount(component)
  }

  mount(component: Vue | VueConstructor) {
    this.id = `id_${Math.random().toString(36).replace('0.', '')}`

    const Inner = Vue.extend({
      functional: true,
      render: createElement => {
        return createElement(
          'div', {
            style: {
              whiteSpace: 'pre-wrap',
            },
            attrs: {
              id: this.id,
            },
          },
        )
      },
    })

    const Component = Vue
      .extend(component)
      .extend({
        components: {
          Inner,
        },
      })

    const props = {
      editor: this.editor,
      inner: Inner,
    }

    this.vm = new Component({
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

  stopEvent(event: Event): boolean {
    const isDraggable = this.node.type.spec.draggable
    const isCopy = event.type === 'copy'
    const isPaste = event.type === 'paste'
    const isCut = event.type === 'cut'
    const isDrag = event.type.startsWith('drag') || event.type === 'drop'

    if ((isDraggable && isDrag) || isCopy || isPaste || isCut) {
      return false
    }

    return true
  }

}

export default function VueRenderer(component: Vue | VueConstructor) {
  return (props: NodeViewRendererProps) => new VueNodeView(component, props) as NodeView
}
