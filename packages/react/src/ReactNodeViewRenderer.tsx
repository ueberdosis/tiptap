import React from 'react'
import {
  NodeView,
  NodeViewProps,
  NodeViewRenderer,
  NodeViewRendererProps,
  NodeViewRendererOptions,
} from '@tiptap/core'
import { Decoration, NodeView as ProseMirrorNodeView } from 'prosemirror-view'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import { Editor } from './Editor'
import { ReactRenderer } from './ReactRenderer'
import { ReactNodeViewContext, ReactNodeViewContextProps } from './useReactNodeView'

export interface ReactNodeViewRendererOptions extends NodeViewRendererOptions {
  update: ((props: {
    oldNode: ProseMirrorNode,
    oldDecorations: Decoration[],
    newNode: ProseMirrorNode,
    newDecorations: Decoration[],
    updateProps: () => void,
  }) => boolean) | null,
}

class ReactNodeView extends NodeView<React.FunctionComponent, Editor, ReactNodeViewRendererOptions> {

  renderer!: ReactRenderer

  contentDOMElement!: HTMLElement | null

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

    if (!(this.component as any).displayName) {
      const capitalizeFirstChar = (string: string): string => {
        return string.charAt(0).toUpperCase() + string.substring(1)
      }

      this.component.displayName = capitalizeFirstChar(this.extension.name)
    }

    const ReactNodeViewProvider: React.FunctionComponent = componentProps => {
      const Component = this.component
      const onDragStart = this.onDragStart.bind(this)
      const nodeViewContentRef: ReactNodeViewContextProps['nodeViewContentRef'] = element => {
        if (
          element
          && this.contentDOMElement
          && element.firstChild !== this.contentDOMElement
        ) {
          element.appendChild(this.contentDOMElement)
        }
      }

      return (
        <ReactNodeViewContext.Provider value={{ onDragStart, nodeViewContentRef }}>
          <Component {...componentProps} />
        </ReactNodeViewContext.Provider>
      )
    }

    ReactNodeViewProvider.displayName = 'ReactNodeView'

    this.contentDOMElement = this.node.isLeaf
      ? null
      : document.createElement(this.node.isInline ? 'span' : 'div')

    if (this.contentDOMElement) {
      // For some reason the whiteSpace prop is not inherited properly in Chrome and Safari
      // With this fix it seems to work fine
      // See: https://github.com/ueberdosis/tiptap/issues/1197
      this.contentDOMElement.style.whiteSpace = 'inherit'
    }

    this.renderer = new ReactRenderer(ReactNodeViewProvider, {
      editor: this.editor,
      props,
      as: this.node.isInline
        ? 'span'
        : 'div',
    })
  }

  get dom() {
    if (
      this.renderer.element.firstElementChild
      && !this.renderer.element.firstElementChild?.hasAttribute('data-node-view-wrapper')
    ) {
      throw Error('Please use the NodeViewWrapper component for your node view.')
    }

    return this.renderer.element
  }

  get contentDOM() {
    if (this.node.isLeaf) {
      return null
    }

    return this.contentDOMElement
  }

  update(node: ProseMirrorNode, decorations: Decoration[]) {
    const updateProps = (props?: Record<string, any>) => {
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

  destroy() {
    this.renderer.destroy()
    this.contentDOMElement = null
  }
}

export function ReactNodeViewRenderer(component: any, options?: Partial<ReactNodeViewRendererOptions>): NodeViewRenderer {
  return (props: NodeViewRendererProps) => {
    // try to get the parent component
    // this is important for vue devtools to show the component hierarchy correctly
    // maybe it’s `undefined` because <editor-content> isn’t rendered yet
    if (!(props.editor as Editor).contentComponent) {
      return {}
    }

    return new ReactNodeView(component, props, options) as ProseMirrorNodeView
  }
}
