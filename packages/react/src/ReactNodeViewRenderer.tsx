import type {
  DecorationWithType,
  Editor,
  NodeViewRenderer,
  NodeViewRendererOptions,
  NodeViewRendererProps,
} from '@tiptap/core'
import { getRenderedAttributes, NodeView } from '@tiptap/core'
import type { Node, Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource, NodeView as ProseMirrorNodeView } from '@tiptap/pm/view'
import type { ComponentType, NamedExoticComponent } from 'react'
import { createElement, createRef, memo } from 'react'

import type { EditorWithContentComponent } from './Editor.js'
import { ReactRenderer } from './ReactRenderer.js'
import type { ReactNodeViewProps } from './types.js'
import type { ReactNodeViewContextProps } from './useReactNodeView.js'
import { ReactNodeViewContext } from './useReactNodeView.js'

export interface ReactNodeViewRendererOptions extends NodeViewRendererOptions {
  /**
   * This function is called when the node view is updated.
   * It allows you to compare the old node with the new node and decide if the component should update.
   */
  update:
    | ((props: {
        oldNode: ProseMirrorNode
        oldDecorations: readonly Decoration[]
        oldInnerDecorations: DecorationSource
        newNode: ProseMirrorNode
        newDecorations: readonly Decoration[]
        innerDecorations: DecorationSource
        updateProps: () => void
      }) => boolean)
    | null
  /**
   * The tag name of the element wrapping the React component.
   */
  as?: string
  /**
   * The class name of the element wrapping the React component.
   */
  className?: string
  /**
   * Attributes that should be applied to the element wrapping the React component.
   * If this is a function, it will be called each time the node view is updated.
   * If this is an object, it will be applied once when the node view is mounted.
   */
  attrs?:
    | Record<string, string>
    | ((props: { node: ProseMirrorNode; HTMLAttributes: Record<string, any> }) => Record<string, string>)
}

export class ReactNodeView<
  T = HTMLElement,
  Component extends ComponentType<ReactNodeViewProps<T>> = ComponentType<ReactNodeViewProps<T>>,
  NodeEditor extends Editor = Editor,
  Options extends ReactNodeViewRendererOptions = ReactNodeViewRendererOptions,
> extends NodeView<Component, NodeEditor, Options> {
  /**
   * The renderer instance.
   */
  renderer!: ReactRenderer<unknown, ReactNodeViewProps<T>>

  /**
   * The element that holds the rich-text content of the node.
   */
  contentDOMElement!: HTMLElement | null

  constructor(component: Component, props: NodeViewRendererProps, options?: Partial<Options>) {
    super(component, props, options)

    if (!this.node.isLeaf) {
      if (this.options.contentDOMElementTag) {
        this.contentDOMElement = document.createElement(this.options.contentDOMElementTag)
      } else {
        this.contentDOMElement = document.createElement(this.node.isInline ? 'span' : 'div')
      }

      this.contentDOMElement.dataset.nodeViewContentReact = ''
      this.contentDOMElement.dataset.nodeViewWrapper = ''

      // For some reason the whiteSpace prop is not inherited properly in Chrome and Safari
      // With this fix it seems to work fine
      // See: https://github.com/ueberdosis/tiptap/issues/1197
      this.contentDOMElement.style.whiteSpace = 'inherit'

      const contentTarget = this.dom.querySelector('[data-node-view-content]')

      if (!contentTarget) {
        return
      }

      contentTarget.appendChild(this.contentDOMElement)
    }
  }

  /**
   * Setup the React component.
   * Called on initialization.
   */
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
      ref: createRef<T>(),
    } satisfies ReactNodeViewProps<T>

    if (!(this.component as any).displayName) {
      const capitalizeFirstChar = (string: string): string => {
        return string.charAt(0).toUpperCase() + string.substring(1)
      }

      this.component.displayName = capitalizeFirstChar(this.extension.name)
    }

    const onDragStart = this.onDragStart.bind(this)
    const nodeViewContentRef: ReactNodeViewContextProps['nodeViewContentRef'] = element => {
      if (element && this.contentDOMElement && element.firstChild !== this.contentDOMElement) {
        // remove the nodeViewWrapper attribute from the element
        if (element.hasAttribute('data-node-view-wrapper')) {
          element.removeAttribute('data-node-view-wrapper')
        }
        element.appendChild(this.contentDOMElement)
      }
    }
    const context = { onDragStart, nodeViewContentRef }
    const Component = this.component
    // For performance reasons, we memoize the provider component
    // And all of the things it requires are declared outside of the component, so it doesn't need to re-render
    const ReactNodeViewProvider: NamedExoticComponent<ReactNodeViewProps<T>> = memo(componentProps => {
      return (
        <ReactNodeViewContext.Provider value={context}>
          {createElement(Component, componentProps)}
        </ReactNodeViewContext.Provider>
      )
    })

    ReactNodeViewProvider.displayName = 'ReactNodeView'

    let as = this.node.isInline ? 'span' : 'div'

    if (this.options.as) {
      as = this.options.as
    }

    const { className = '' } = this.options

    this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this)

    this.renderer = new ReactRenderer(ReactNodeViewProvider, {
      editor: this.editor,
      props,
      as,
      className: `node-${this.node.type.name} ${className}`.trim(),
    })

    this.editor.on('selectionUpdate', this.handleSelectionUpdate)
    this.updateElementAttributes()
  }

  /**
   * Return the DOM element.
   * This is the element that will be used to display the node view.
   */
  get dom() {
    if (
      this.renderer.element.firstElementChild &&
      !this.renderer.element.firstElementChild?.hasAttribute('data-node-view-wrapper')
    ) {
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

    return this.contentDOMElement
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
      if (this.renderer.props.selected) {
        return
      }

      this.selectNode()
    } else {
      if (!this.renderer.props.selected) {
        return
      }

      this.deselectNode()
    }
  }

  /**
   * On update, update the React component.
   * To prevent unnecessary updates, the `update` option can be used.
   */
  update(node: Node, decorations: readonly Decoration[], innerDecorations: DecorationSource): boolean {
    const rerenderComponent = (props?: Record<string, any>) => {
      this.renderer.updateProps(props)
      if (typeof this.options.attrs === 'function') {
        this.updateElementAttributes()
      }
    }

    if (node.type !== this.node.type) {
      return false
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

  /**
   * Destroy the React component instance.
   */
  destroy() {
    this.renderer.destroy()
    this.editor.off('selectionUpdate', this.handleSelectionUpdate)
    this.contentDOMElement = null
  }

  /**
   * Update the attributes of the top-level element that holds the React component.
   * Applying the attributes defined in the `attrs` option.
   */
  updateElementAttributes() {
    if (this.options.attrs) {
      let attrsObj: Record<string, string> = {}

      if (typeof this.options.attrs === 'function') {
        const extensionAttributes = this.editor.extensionManager.attributes
        const HTMLAttributes = getRenderedAttributes(this.node, extensionAttributes)

        attrsObj = this.options.attrs({ node: this.node, HTMLAttributes })
      } else {
        attrsObj = this.options.attrs
      }

      this.renderer.updateAttributes(attrsObj)
    }
  }
}

/**
 * Create a React node view renderer.
 */
export function ReactNodeViewRenderer<T = HTMLElement>(
  component: ComponentType<ReactNodeViewProps<T>>,
  options?: Partial<ReactNodeViewRendererOptions>,
): NodeViewRenderer {
  return props => {
    // try to get the parent component
    // this is important for vue devtools to show the component hierarchy correctly
    // maybe it’s `undefined` because <editor-content> isn’t rendered yet
    if (!(props.editor as EditorWithContentComponent).contentComponent) {
      return {} as unknown as ProseMirrorNodeView
    }

    return new ReactNodeView<T>(component, props, options)
  }
}
