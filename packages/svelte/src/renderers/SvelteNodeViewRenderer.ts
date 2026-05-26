import type {
  DecorationWithType,
  NodeViewProps,
  NodeViewRenderer,
  NodeViewRendererOptions,
} from '@tiptap/core'
import { NodeView } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource } from '@tiptap/pm/view'

import NodeViewFrame from '../components/NodeViewFrame.svelte'
import type { Editor } from '../Editor.js'
import { SvelteRenderer } from './SvelteRenderer.svelte.js'

export interface SvelteNodeViewRendererOptions extends NodeViewRendererOptions {
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

class SvelteNodeView extends NodeView<any, Editor, SvelteNodeViewRendererOptions> {
  renderer!: SvelteRenderer

  decorationClasses!: string

  private cachedExtensionWithSyncedStorage: NodeViewProps['extension'] | null = null

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

    this.decorationClasses = this.getDecorationClasses()

    this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this)
    this.editor.on('selectionUpdate', this.handleSelectionUpdate)

    this.renderer = new SvelteRenderer(NodeViewFrame, {
      props: {
        component: this.component,
        onDragStart,
        decorationClasses: this.decorationClasses,
        ...props,
      },
    })
  }

  get dom() {
    if (!this.renderer.element || !this.renderer.element.hasAttribute('data-node-view-wrapper')) {
      throw Error('Please use the NodeViewWrapper component for your node view.')
    }

    return this.renderer.element as HTMLElement
  }

  get contentDOM() {
    if (this.node.isLeaf) {
      return null
    }

    return this.dom.querySelector('[data-node-view-content]') as HTMLElement | null
  }

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

  update(
    node: ProseMirrorNode,
    decorations: readonly Decoration[],
    innerDecorations: DecorationSource,
  ): boolean {
    const rerenderComponent = (props?: Record<string, any>) => {
      this.decorationClasses = this.getDecorationClasses()
      this.renderer.updateProps({ decorationClasses: this.decorationClasses, ...props })
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
        updateProps: () =>
          rerenderComponent({
            node,
            decorations,
            innerDecorations,
            extension: this.extensionWithSyncedStorage,
          }),
      })
    }

    if (node.type !== this.node.type) {
      return false
    }

    if (
      node === this.node &&
      this.decorations === decorations &&
      this.innerDecorations === innerDecorations
    ) {
      return true
    }

    this.node = node
    this.decorations = decorations
    this.innerDecorations = innerDecorations

    rerenderComponent({
      node,
      decorations,
      innerDecorations,
      extension: this.extensionWithSyncedStorage,
    })

    return true
  }

  selectNode() {
    this.renderer.updateProps({
      selected: true,
    })
    if (this.renderer.element) {
      this.renderer.element.classList.add('ProseMirror-selectednode')
    }
  }

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
  }
}

export function SvelteNodeViewRenderer(
  component: any,
  options?: Partial<SvelteNodeViewRendererOptions>,
): NodeViewRenderer {
  return props => {
    return new SvelteNodeView(component, props, options)
  }
}
