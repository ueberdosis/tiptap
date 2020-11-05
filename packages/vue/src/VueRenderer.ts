import { NodeViewRendererProps } from '@tiptap/core'
import { NodeView } from 'prosemirror-view'
import Vue from 'vue'
import { VueConstructor } from 'vue/types/umd'

class VueNodeView implements NodeView {

  vm!: Vue

  constructor(component: Vue | VueConstructor, props: NodeViewRendererProps) {
    // eslint-disable-next-line
    const { node, editor, getPos } = props
    // eslint-disable-next-line
    const { view } = editor

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

  stopEvent() {
    return true
  }

}

export default function VueRenderer(component: Vue | VueConstructor) {
  return (props: NodeViewRendererProps) => new VueNodeView(component, props) as NodeView
}
