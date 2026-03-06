/* eslint-disable no-underscore-dangle */
import type { DecorationWithType, NodeViewProps, NodeViewRenderer, NodeViewRendererOptions } from '@tiptap/core'
import { cancelPositionCheck, NodeView, schedulePositionCheck } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource, NodeView as ProseMirrorNodeView } from '@tiptap/pm/view'
import type { Component, PropType, Ref } from 'vue'
import { defineComponent, provide, ref } from 'vue'

import type { Editor } from './Editor.js'
import { VueRenderer } from './VueRenderer.js'

export const nodeViewProps = {
  editor: {
    type: Object as PropType<NodeViewProps['editor']>,
    required: true as const,
  },
  node: {
    type: Object as PropType<NodeViewProps['node']>,
    required: true as const,
  },
  decorations: {
    type: Object as PropType<NodeViewProps['decorations']>,
    required: true as const,
  },
  selected: {
    type: Boolean as PropType<NodeViewProps['selected']>,
    required: true as const,
  },
  extension: {
    type: Object as PropType<NodeViewProps['extension']>,
    required: true as const,
  },
  getPos: {
    type: Function as PropType<NodeViewProps['getPos']>,
    required: true as const,
  },
  updateAttributes: {
    type: Function as PropType<NodeViewProps['updateAttributes']>,
    required: true as const,
  },
  deleteNode: {
    type: Function as PropType<NodeViewProps['deleteNode']>,
    required: true as const,
  },
  view: {
    type: Object as PropType<NodeViewProps['view']>,
    required: true as const,
  },
  innerDecorations: {
    type: Object as PropType<NodeViewProps['innerDecorations']>,
    required: true as const,
  },
  HTMLAttributes: {
    type: Object as PropType<NodeViewProps['HTMLAttributes']>,
    required: true as const,
  },
}

export interface VueNodeViewRendererOptions extends NodeViewRendererOptions {
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
}

class VueNodeView extends NodeView<Component, Editor, VueNodeViewRendererOptions> {
  renderer!: VueRenderer

  decorationClasses!: Ref<string>

  /**
   * The last known position of this node view, used to detect position-only
   * changes that don't produce a new node object reference.
   */
  private currentPos: number | undefined

  /**
   * Callback registered with the per-editor position-update registry.
   * Stored so it can be unregistered in destroy().
   */
  private positionCheckCallback: (() => void) | null = null

  private cachedExtensionWithSyncedStorage: NodeViewProps['extension'] | null = null

  /**
   * Returns a proxy of the extension that redirects storage access to the editor's mutable storage.
   * This preserves the original prototype chain (instanceof checks, methods like configure/extend work).
   * Cached to avoid proxy creation on every update.
   */
  get extensionWithSyncedStorage(): NodeViewProps['extension'] {
    if (!this.cachedExtensionWithSyncedStorage) {
      const editor = this.editor
      const extension = this.extension

      this.cachedExtensionWithSyncedStorage = new Proxy(extension, {
        get(target, prop, receiver) {
          if (prop === 'storage') {
            return editor.storage[extension.name as keyof typeof editor.storage] ?? {}
          }
          return Reflect.get(target, prop, receiver)
        },
      })
    }

    return this.cachedExtensionWithSyncedStorage
  }

  mount() {
    const props = {
      editor: this.editor,
      node: this.node,
      decorations: this.decorations as DecorationWithType[],
      innerDecorations: this.innerDecorations,
      view: this.view,
      selected: false,
      extension: this.extensionWithSyncedStorage,
      HTMLAttributes: this.HTMLAttributes,
      getPos: () => this.getPos(),
      updateAttributes: (attributes = {}) => this.updateAttributes(attributes),
      deleteNode: () => this.deleteNode(),
    } satisfies NodeViewProps

    const onDragStart = this.onDragStart.bind(this)

    this.decorationClasses = ref(this.getDecorationClasses())

    const extendedComponent = defineComponent({
      extends: { ...this.component },
      props: Object.keys(props),
      template: (this.component as any).template,
      setup: reactiveProps => {
        provide('onDragStart', onDragStart)
        provide('decorationClasses', this.decorationClasses)

        return (this.component as any).setup?.(reactiveProps, {
          expose: () => undefined,
        })
      },
      // add support for scoped styles
      // @ts-ignore
      // eslint-disable-next-line
      __scopeId: this.component.__scopeId,
      // add support for CSS Modules
      // @ts-ignore
      // eslint-disable-next-line
      __cssModules: this.component.__cssModules,
      // add support for vue devtools
      // @ts-ignore
      // eslint-disable-next-line
      __name: this.component.__name,
      // @ts-ignore
      // eslint-disable-next-line
      __file: this.component.__file,
    })

    this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this)
    this.editor.on('selectionUpdate', this.handleSelectionUpdate)
    this.currentPos = this.getPos()

    this.positionCheckCallback = () => {
      // Guard against the callback firing before the renderer is fully initialized.
      if (!this.renderer) {
        return
      }

      const newPos = this.getPos()

      if (typeof newPos !== 'number' || newPos === this.currentPos) {
        return
      }

      this.currentPos = newPos

      // Pass a fresh getPos reference so Vue's reactivity detects a prop change.
      this.renderer.updateProps({ getPos: () => this.getPos() })
    }

    schedulePositionCheck(this.editor, this.positionCheckCallback)

    this.renderer = new VueRenderer(extendedComponent, {
      editor: this.editor,
      props,
    })
  }

  /**
   * Return the DOM element.
   * This is the element that will be used to display the node view.
   */
  get dom() {
    if (!this.renderer.element || !this.renderer.element.hasAttribute('data-node-view-wrapper')) {
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

    return this.dom.querySelector('[data-node-view-content]') as HTMLElement | null
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
  update(node: ProseMirrorNode, decorations: readonly Decoration[], innerDecorations: DecorationSource): boolean {
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
      this.currentPos = this.getPos()

      return this.options.update({
        oldNode,
        oldDecorations,
        newNode: node,
        newDecorations: decorations,
        oldInnerDecorations,
        innerDecorations,
        updateProps: () =>
          rerenderComponent({ node, decorations, innerDecorations, extension: this.extensionWithSyncedStorage }),
      })
    }

    if (node.type !== this.node.type) {
      return false
    }

    const newPos = this.getPos()

    if (node === this.node && this.decorations === decorations && this.innerDecorations === innerDecorations) {
      if (newPos === this.currentPos) {
        return true
      }

      // Position changed without a content/decoration change — trigger re-render
      // so the component receives an up-to-date value from getPos().
      // Pass a fresh getPos reference so Vue's reactivity detects a prop change.
      this.currentPos = newPos
      rerenderComponent({
        node,
        decorations,
        innerDecorations,
        extension: this.extensionWithSyncedStorage,
        getPos: () => this.getPos(),
      })
      return true
    }

    this.node = node
    this.decorations = decorations
    this.innerDecorations = innerDecorations
    this.currentPos = newPos

    rerenderComponent({ node, decorations, innerDecorations, extension: this.extensionWithSyncedStorage })

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
    if (this.renderer.element) {
      this.renderer.element.classList.add('ProseMirror-selectednode')
    }
  }

  /**
   * Deselect the node.
   * Remove the `selected` prop and the `ProseMirror-selectednode` class.
   */
  deselectNode() {
    this.renderer.updateProps({
      selected: false,
    })
    if (this.renderer.element) {
      this.renderer.element.classList.remove('ProseMirror-selectednode')
    }
  }

  getDecorationClasses() {
    return (
      this.decorations
        // @ts-ignore
        .flatMap(item => item.type.attrs.class)
        .join(' ')
    )
  }

  destroy() {
    this.renderer.destroy()
    this.editor.off('selectionUpdate', this.handleSelectionUpdate)

    if (this.positionCheckCallback) {
      cancelPositionCheck(this.editor, this.positionCheckCallback)
      this.positionCheckCallback = null
    }
  }
}

export function VueNodeViewRenderer(
  component: Component<NodeViewProps>,
  options?: Partial<VueNodeViewRendererOptions>,
): NodeViewRenderer {
  return props => {
    // try to get the parent component
    // this is important for vue devtools to show the component hierarchy correctly
    // maybe it’s `undefined` because <editor-content> isn’t rendered yet
    if (!(props.editor as Editor).contentComponent) {
      return {} as unknown as ProseMirrorNodeView
    }
    // check for class-component and normalize if neccessary
    const normalizedComponent =
      typeof component === 'function' && '__vccOpts' in component ? (component.__vccOpts as Component) : component

    return new VueNodeView(normalizedComponent, props, options)
  }
}
