import {
  NodeView,
  NodeViewProps,
  NodeViewRenderer,
  NodeViewRendererProps,
} from '@tiptap/core'
import { Decoration, NodeView as ProseMirrorNodeView } from 'prosemirror-view'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import Vue from 'vue'
import { VueConstructor, PropType } from 'vue/types/umd'
import { Editor } from './Editor'
import { VueRenderer } from './VueRenderer'

export const nodeViewProps = {
  editor: {
    type: Object as PropType<NodeViewProps['editor']>,
    required: true,
  },
  node: {
    type: Object as PropType<NodeViewProps['node']>,
    required: true,
  },
  decorations: {
    type: Object as PropType<NodeViewProps['decorations']>,
    required: true,
  },
  selected: {
    type: Boolean as PropType<NodeViewProps['selected']>,
    required: true,
  },
  extension: {
    type: Object as PropType<NodeViewProps['extension']>,
    required: true,
  },
  getPos: {
    type: Function as PropType<NodeViewProps['getPos']>,
    required: true,
  },
  updateAttributes: {
    type: Function as PropType<NodeViewProps['updateAttributes']>,
    required: true,
  },
}

interface VueNodeViewRendererOptions {
  stopEvent: ((event: Event) => boolean) | null,
  update: ((node: ProseMirrorNode, decorations: Decoration[]) => boolean) | null,
}

class VueNodeView extends NodeView<(Vue | VueConstructor), Editor> {

  renderer!: VueRenderer

  mount() {
    const props: NodeViewProps = {
      editor: this.editor,
      node: this.node,
      decorations: this.decorations,
      selected: false,
      extension: this.extension,
      getPos: () => this.getPos(),
      updateAttributes: (attributes = {}) => this.updateAttributes(attributes),
    }

    const onDragStart = this.onDragStart.bind(this)
    const isEditable = Vue.observable({
      value: this.editor.isEditable,
    })

    this.editor.on('viewUpdate', () => {
      isEditable.value = this.editor.isEditable
    })

    const Component = Vue
      .extend(this.component)
      .extend({
        props: Object.keys(props),
        provide() {
          return {
            onDragStart,
            isEditable,
          }
        },
      })

    this.renderer = new VueRenderer(Component, {
      parent: this.editor.contentComponent,
      propsData: props,
    })
  }

  get dom() {
    if (!this.renderer.element.hasAttribute('data-node-view-wrapper')) {
      throw Error('Please use the NodeViewWrapper component for your node view.')
    }

    return this.renderer.element
  }

  get contentDOM() {
    if (this.node.isLeaf) {
      return null
    }

    const contentElement = this.dom.querySelector('[data-node-view-content]')

    return contentElement || this.dom
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
    this.renderer.updateProps({ node, decorations })

    return true
  }

  selectNode() {
    this.renderer.updateProps({
      selected: true,
    })
  }

  deselectNode() {
    this.renderer.updateProps({
      selected: false,
    })
  }

  destroy() {
    this.renderer.destroy()
  }

}

export function VueNodeViewRenderer(component: Vue | VueConstructor, options?: Partial<VueNodeViewRendererOptions>): NodeViewRenderer {
  return (props: NodeViewRendererProps) => {
    // try to get the parent component
    // this is important for vue devtools to show the component hierarchy correctly
    // maybe it’s `undefined` because <editor-content> isn’t rendered yet
    if (!(props.editor as Editor).contentComponent) {
      return {}
    }

    return new VueNodeView(component, props, options) as ProseMirrorNodeView
  }
}
