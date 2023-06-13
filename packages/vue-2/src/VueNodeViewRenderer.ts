import {
  DecorationWithType,
  NodeView,
  NodeViewProps,
  NodeViewRenderer,
  NodeViewRendererOptions,
  NodeViewRendererProps,
} from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Decoration, NodeView as ProseMirrorNodeView } from '@tiptap/pm/view'
import Vue from 'vue'
import { VueConstructor } from 'vue/types/umd'
import { booleanProp, functionProp, objectProp } from 'vue-ts-types'

import { Editor } from './Editor'
import { VueRenderer } from './VueRenderer'

export const nodeViewProps = {
  editor: objectProp<NodeViewProps['editor']>().required,
  node: objectProp<NodeViewProps['node']>().required,
  decorations: objectProp<NodeViewProps['decorations']>().required,
  selected: booleanProp().required,
  extension: objectProp<NodeViewProps['extension']>().required,
  getPos: functionProp<NodeViewProps['getPos']>().required,
  updateAttributes: functionProp<NodeViewProps['updateAttributes']>().required,
  deleteNode: functionProp<NodeViewProps['deleteNode']>().required,
}

export interface VueNodeViewRendererOptions extends NodeViewRendererOptions {
  update:
    | ((props: {
        oldNode: ProseMirrorNode
        oldDecorations: Decoration[]
        newNode: ProseMirrorNode
        newDecorations: Decoration[]
        updateProps: () => void
      }) => boolean)
    | null
}

class VueNodeView extends NodeView<Vue | VueConstructor, Editor, VueNodeViewRendererOptions> {
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

    // @ts-ignore
    const vue = this.editor.contentComponent?.$options._base ?? Vue // eslint-disable-line

    const Component = vue.extend(this.component).extend({
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

    return this.renderer.element as HTMLElement
  }

  get contentDOM() {
    if (this.node.isLeaf) {
      return null
    }

    const contentElement = this.dom.querySelector('[data-node-view-content]')

    return (contentElement || this.dom) as HTMLElement | null
  }

  update(node: ProseMirrorNode, decorations: DecorationWithType[]) {
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
        updateProps: () => updateProps({ node, decorations }),
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
    return (
      this.decorations
        // @ts-ignore
        .map(item => item.type.attrs.class)
        .flat()
        .join(' ')
    )
  }

  destroy() {
    this.renderer.destroy()
  }
}

export function VueNodeViewRenderer(
  component: Vue | VueConstructor,
  options?: Partial<VueNodeViewRendererOptions>,
): NodeViewRenderer {
  return (props: NodeViewRendererProps) => {
    // try to get the parent component
    // this is important for vue devtools to show the component hierarchy correctly
    // maybe it’s `undefined` because <editor-content> isn’t rendered yet
    if (!(props.editor as Editor).contentComponent) {
      return {}
    }

    return new VueNodeView(component, props, options) as unknown as ProseMirrorNodeView
  }
}
