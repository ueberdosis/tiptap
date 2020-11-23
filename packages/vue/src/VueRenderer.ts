import { Editor, Node, NodeViewRendererProps } from '@tiptap/core'
import { Decoration, NodeView } from 'prosemirror-view'

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

  decorations!: Decoration[]

  id!: string

  getPos!: any

  constructor(component: Vue | VueConstructor, props: NodeViewRendererProps) {
    this.editor = props.editor
    this.extension = props.extension
    this.node = props.node
    this.getPos = props.getPos
    this.mount(component)
  }

  mount(component: Vue | VueConstructor) {
    this.id = `id_${Math.random().toString(36).replace('0.', '')}`

    const { id } = this

    const Inner = Vue.extend({
      // functional: true,
      inheritAttrs: false,
      props: {
        as: {
          type: String,
          default: 'div',
        },
      },
      render(createElement, context) {
        return createElement(
          // context.props.as, {
          this.as, {
            style: {
              whiteSpace: 'pre-wrap',
            },
            attrs: {
              id,
              // contenteditable: true,
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
      node: this.node,
      updateAttrs: (attrs: {}) => this.updateAttrs(attrs),
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
    // console.log(event.type)

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

  updateAttrs(attrs: {}) {
    if (!this.editor.view.editable) {
      return
    }

    const { state } = this.editor.view
    // const { type } = this.node
    const pos = this.getPos()
    const newAttrs = {
      ...this.node.attrs,
      ...attrs,
    }
    // const transaction = this.isMark
    //   ? state.tr
    //     .removeMark(pos.from, pos.to, type)
    //     .addMark(pos.from, pos.to, type.create(newAttrs))
    //   : state.tr.setNodeMarkup(pos, null, newAttrs)
    const transaction = state.tr.setNodeMarkup(pos, undefined, newAttrs)

    this.editor.view.dispatch(transaction)
  }

}

export default function VueRenderer(component: Vue | VueConstructor) {
  return (props: NodeViewRendererProps) => new VueNodeView(component, props) as NodeView
}
