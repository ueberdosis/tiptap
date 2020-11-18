import { Node, NodeViewRendererProps } from '@tiptap/core'
import { NodeView } from 'prosemirror-view'

import {
  Node as ProseMirrorNode,
} from 'prosemirror-model'
import Vue from 'vue'
import { VueConstructor } from 'vue/types/umd'

class VueNodeView implements NodeView {

  vm!: Vue

  extension!: Node

  node!: ProseMirrorNode

  constructor(component: Vue | VueConstructor, props: NodeViewRendererProps) {
    // eslint-disable-next-line
    const { node, editor, getPos } = props
    // eslint-disable-next-line
    const { view } = editor

    this.extension = props.extension
    this.node = props.node

    this.mount(component)
  }

  mount(component: Vue | VueConstructor) {
    const Component = Vue.extend(component)

    this.vm = new Component({
      // parent: this.parent,
      // propsData: props,
    }).$mount()
  }

  get dom() {
    return this.vm.$el
  }

  get contentDOM() {
    return this.vm.$refs.content as Element
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
