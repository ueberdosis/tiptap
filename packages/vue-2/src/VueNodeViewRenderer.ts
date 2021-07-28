import {
  NodeView,
  NodeViewProps,
  NodeViewRenderer,
  NodeViewRendererProps,
  NodeViewRendererOptions,
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
  deleteNode: {
    type: Function as PropType<NodeViewProps['deleteNode']>,
    required: true,
  },
}

export interface VueNodeViewRendererOptions extends NodeViewRendererOptions {
  update: ((props: {
    oldNode: ProseMirrorNode,
    oldDecorations: Decoration[],
    newNode: ProseMirrorNode,
    newDecorations: Decoration[],
    updateProps: () => void,
  }) => boolean) | null,
}

class VueNodeView extends NodeView<(Vue | VueConstructor), Editor, VueNodeViewRendererOptions> {

  renderer!: VueRenderer

  decorationClasses!: {
    value: string
  }

  mount() {
    const props: NodeViewProps = {
      editor: this.editor,
      node: this.node,
      decorations: this.decorations,
      selected: false,
      extension: this.extension,
      getPos: () => this.getPos(),
      updateAttributes: (attributes = {}) => this.updateAttributes(attributes),
      deleteNode: () => this.deleteNode(),
    }

    const onDragStart = this.onDragStart.bind(this)

    this.decorationClasses = Vue.observable({
      value: this.getDecorationClasses(),
    })

    const Component = Vue
      .extend(this.component)
      .extend({
        props: Object.keys(props),
        provide: () => {
          return {
            onDragStart,
            decorationClasses: this.decorationClasses,
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
    const updateProps = (props?: Record<string, any>) => {
      this.decorationClasses.value = this.getDecorationClasses()
      this.renderer.updateProps(props)
    }

    if (typeof this.options.update === 'function') {
      const oldNode = this.node
      const oldDecorations = this.decorations

      this.node = node
      this.decorations = decorations

      return this.options.update({
        oldNode,
        oldDecorations,
        newNode: node,
        newDecorations: decorations,
        updateProps,
      })
    }

    if (node.type !== this.node.type) {
      return false
    }

    if (node === this.node && this.decorations === decorations) {
      return true
    }

    this.node = node
    this.decorations = decorations

    updateProps({ node, decorations })

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

  getDecorationClasses() {
    return this.decorations
      // @ts-ignore
      .map(item => item.type.attrs.class)
      .flat()
      .join(' ')
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
