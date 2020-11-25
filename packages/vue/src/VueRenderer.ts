import { Editor, Node, NodeViewRendererProps } from '@tiptap/core'
import { Decoration, NodeView } from 'prosemirror-view'
import { NodeSelection } from 'prosemirror-state'
import { Node as ProseMirrorNode } from 'prosemirror-model'
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

    document.addEventListener('dragend', this.onDragEnd)
  }

  createUniqueId() {
    this.id = `id_${Math.floor(Math.random() * 0xFFFFFFFF)}`
  }

  createNodeViewWrapper() {
    const nodeview = this
    const { view } = this.editor
    const { getPos } = this

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
            // attrs: {
            //   // draggable: false,
            //   contenteditable: false,
            // },
            on: {
              dragstart: (event: Event) => {
                const target = (event.target as HTMLElement)

                if (nodeview.contentDOM?.contains(target)) {
                  return
                }

                view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, getPos())))
              },
              dragend: (event: Event) => {
                const target = (event.target as HTMLElement)

                if (nodeview.contentDOM?.contains(target)) {
                  return
                }

                nodeview.isDragging = false
              },
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
    const target = (event.target as HTMLElement)
    const isInElement = this.dom.contains(target) && !this.contentDOM?.contains(target)
    const isDraggable = this.node.type.spec.draggable
    const isCopyEvent = event.type === 'copy'
    const isPasteEvent = event.type === 'paste'
    const isCutEvent = event.type === 'cut'
    const isDragEvent = event.type.startsWith('drag') || event.type === 'drop'

    if (!isInElement) {
      return false
    }

    if (isDragEvent && !this.isDragging) {
      event.preventDefault()
      return false
    }

    if (isDraggable && !this.isDragging && event.type === 'mousedown') {
      const dragHandle = target.closest('[data-drag-handle]')
      // const isValidDragHandle = dragHandle
      //   && (this.dom === dragHandle || (this.dom.contains(dragHandle) && !this.contentDOM?.contains(dragHandle)))
      const isValidDragHandle = dragHandle
        && (this.dom === dragHandle || (this.dom.contains(dragHandle)))

      if (isValidDragHandle) {
        this.isDragging = true
        // this.isDragging = true
        // document.addEventListener('dragend', (e: Event) => {
        //   console.log('DRAGEEEND')
        //   // const t = (e.target as HTMLElement)
        //   // if (t === this.dom) {
        //   //   console.log('JEP')
        //   // } else {
        //   //   console.log('NOPE')
        //   // }
        //   // // if (t === this.dom) {
        //   // //   this.isDragging = false
        //   // // }
        //   this.isDragging = false
        // }, { once: true })
        // console.log('BIND EVENT', this.dom)
        // document.addEventListener('dragend', this.onDragEnd, { once: true })
      }
    }

    if (this.isDragging || isCopyEvent || isPasteEvent || isCutEvent) {
      return false
    }

    return true
  }

  onDragEnd(event: Event) {
    // console.log('ONDRAGEND')
    // const target = (event.target as HTMLElement)

    // if (target === this.dom) {
    //   console.log('JEP')
    //   this.isDragging = false
    // } else {
    //   console.log('NOPE')
    // }
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

  selectNode() {
    // this.updateComponentProps({
    //   selected: true,
    // })
  }

  deselectNode() {
    // this.updateComponentProps({
    //   selected: false,
    // })
  }

  destroy() {
    this.vm.$destroy()
    document.removeEventListener('dragend', this.onDragEnd)
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
