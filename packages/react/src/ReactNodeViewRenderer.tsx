import React, { useState, useEffect } from 'react'
import {
  NodeView,
  NodeViewProps,
  NodeViewRenderer,
  NodeViewRendererProps,
} from '@tiptap/core'
import { Decoration, NodeView as ProseMirrorNodeView } from 'prosemirror-view'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import { Editor } from './Editor'
import { ReactRenderer } from './ReactRenderer'
import { ReactNodeViewContext } from './useReactNodeView'

interface ReactNodeViewRendererOptions {
  stopEvent: ((event: Event) => boolean) | null,
  update: ((node: ProseMirrorNode, decorations: Decoration[]) => boolean) | null,
}

class ReactNodeView extends NodeView<React.FunctionComponent, Editor> {

  renderer!: ReactRenderer

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

    if (!(this.component as any).displayName) {
      const capitalizeFirstChar = (string: string): string => {
        return string.charAt(0).toUpperCase() + string.substring(1)
      }

      // @ts-ignore
      this.component.displayName = capitalizeFirstChar(this.extension.config.name)
    }

    const ReactNodeViewProvider: React.FunctionComponent = componentProps => {
      const [isEditable, setIsEditable] = useState(this.editor.isEditable)
      const onDragStart = this.onDragStart.bind(this)
      const onViewUpdate = () => setIsEditable(this.editor.isEditable)
      const Component = this.component

      useEffect(() => {
        this.editor.on('viewUpdate', onViewUpdate)

        return () => {
          this.editor.off('viewUpdate', onViewUpdate)
        }
      }, [])

      return (
        // @ts-ignore
        <ReactNodeViewContext.Provider value={{ onDragStart, isEditable }}>
          {
            // @ts-ignore
            <Component {...componentProps} />
          }
        </ReactNodeViewContext.Provider>
      )
    }

    ReactNodeViewProvider.displayName = 'ReactNodeView'

    this.renderer = new ReactRenderer(ReactNodeViewProvider, {
      editor: this.editor,
      props,
      as: this.node.isInline
        ? 'span'
        : 'div',
    })
  }

  get dom() {
    if (!this.renderer.element.firstElementChild?.hasAttribute('data-node-view-wrapper')) {
      throw Error('Please use the ReactViewWrapper component for your node view.')
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
