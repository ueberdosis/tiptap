import {
  DecorationWithType,
  NodeView,
  NodeViewProps,
  NodeViewRenderer,
  NodeViewRendererOptions,
} from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Decoration, DecorationSource, NodeView as ProseMirrorNodeView } from '@tiptap/pm/view'
import Vue from 'vue'
import { VueConstructor } from 'vue/types/umd'
import { booleanProp, functionProp, objectProp } from 'vue-ts-types'

import { Editor } from './Editor.js'
import { VueRenderer } from './VueRenderer.js'

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
      oldNode: ProseMirrorNode;
      oldDecorations: readonly Decoration[];
      oldInnerDecorations: DecorationSource;
      newNode: ProseMirrorNode;
      newDecorations: readonly Decoration[];
      innerDecorations: DecorationSource;
      updateProps: () => void;
      }) => boolean)
    | null;
}

class VueNodeView extends NodeView<Vue | VueConstructor, Editor, VueNodeViewRendererOptions> {
  renderer!: VueRenderer

  decorationClasses!: {
    value: string;
  }

  mount() {
    const props = {
      editor: this.editor,
      node: this.node,
      decorations: this.decorations as DecorationWithType[],
      innerDecorations: this.innerDecorations,
      view: this.view,
      selected: false,
      extension: this.extension,
      HTMLAttributes: this.HTMLAttributes,
      getPos: () => this.getPos(),
      updateAttributes: (attributes = {}) => this.updateAttributes(attributes),
      deleteNode: () => this.deleteNode(),
    } satisfies NodeViewProps

    const onDragStart = this.onDragStart.bind(this)

    this.decorationClasses = Vue.observable({
      value: this.getDecorationClasses(),
    })

    // @ts-ignore
    const vue = this.editor.contentComponent?.$options._base ?? Vue; // eslint-disable-line

    const Component = vue.extend(this.component).extend({
      props: Object.keys(props),
      provide: () => {
        return {
          onDragStart,
          decorationClasses: this.decorationClasses,
        }
      },
    })

    this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this)
    this.editor.on('selectionUpdate', this.handleSelectionUpdate)

    this.renderer = new VueRenderer(Component, {
      parent: this.editor.contentComponent,
      propsData: props,
    })
  }

  /**
   * Return the DOM element.
   * This is the element that will be used to display the node view.
   */
  get dom() {
    if (!this.renderer.element.hasAttribute('data-node-view-wrapper')) {
      throw Error('Please use the NodeViewWrapper component for your node view.')
    }

    return this.renderer.element as HTMLElement
  }

  /**
   * Return the content DOM element.
   * This is the element that will be used to display the rich-text content of the node.
   */
  get contentDOM() {
    if (this.node.isLeaf) {
      return null
    }

    const contentElement = this.dom.querySelector('[data-node-view-content]')

    return (contentElement || this.dom) as HTMLElement | null
  }

  /**
   * On editor selection update, check if the node is selected.
   * If it is, call `selectNode`, otherwise call `deselectNode`.
   */
  handleSelectionUpdate() {
    const { from, to } = this.editor.state.selection
    const pos = this.getPos()

    if (typeof pos !== 'number') {
      return
    }

    if (from <= pos && to >= pos + this.node.nodeSize) {
      if (this.renderer.ref.$props.selected) {
        return
      }

      this.selectNode()
    } else {
      if (!this.renderer.ref.$props.selected) {
        return
      }

      this.deselectNode()
    }
  }

  /**
   * On update, update the React component.
   * To prevent unnecessary updates, the `update` option can be used.
   */
  update(
    node: ProseMirrorNode,
    decorations: readonly Decoration[],
    innerDecorations: DecorationSource,
  ): boolean {
    const rerenderComponent = (props?: Record<string, any>) => {
      this.decorationClasses.value = this.getDecorationClasses()
      this.renderer.updateProps(props)
    }

    if (typeof this.options.update === 'function') {
      const oldNode = this.node
      const oldDecorations = this.decorations
      const oldInnerDecorations = this.innerDecorations

      this.node = node
      this.decorations = decorations
      this.innerDecorations = innerDecorations

      return this.options.update({
        oldNode,
        oldDecorations,
        newNode: node,
        newDecorations: decorations,
        oldInnerDecorations,
        innerDecorations,
        updateProps: () => rerenderComponent({ node, decorations, innerDecorations }),
      })
    }

    if (node.type !== this.node.type) {
      return false
    }

    if (node === this.node && this.decorations === decorations && this.innerDecorations === innerDecorations) {
      return true
    }

    this.node = node
    this.decorations = decorations
    this.innerDecorations = innerDecorations

    rerenderComponent({ node, decorations, innerDecorations })

    return true
  }

  /**
   * Select the node.
   * Add the `selected` prop and the `ProseMirror-selectednode` class.
   */
  selectNode() {
    this.renderer.updateProps({
      selected: true,
    })
    this.renderer.element.classList.add('ProseMirror-selectednode')
  }

  /**
   * Deselect the node.
   * Remove the `selected` prop and the `ProseMirror-selectednode` class.
   */
  deselectNode() {
    this.renderer.updateProps({
      selected: false,
    })
    this.renderer.element.classList.remove('ProseMirror-selectednode')
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
    this.editor.off('selectionUpdate', this.handleSelectionUpdate)
  }
}

export function VueNodeViewRenderer(
  component: Vue | VueConstructor,
  options?: Partial<VueNodeViewRendererOptions>,
): NodeViewRenderer {
  return props => {
    // try to get the parent component
    // this is important for vue devtools to show the component hierarchy correctly
    // maybe it’s `undefined` because <editor-content> isn’t rendered yet
    if (!(props.editor as Editor).contentComponent) {
      return {} as unknown as ProseMirrorNodeView
    }

    return new VueNodeView(component, props, options)
  }
}
