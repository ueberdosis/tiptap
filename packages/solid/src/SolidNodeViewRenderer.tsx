/* oslint-disable no-underscore-dangle */
import type {
  DecorationWithType,
  NodeViewProps,
  NodeViewRenderer,
  NodeViewRendererOptions,
  NodeViewRendererProps,
} from '@tiptap/core'
import { isNodeViewSelected, NodeView } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource, NodeView as ProseMirrorNodeView } from '@tiptap/pm/view'
import type { Component } from 'solid-js'
import { createRoot } from 'solid-js'
import { createStore, unwrap } from 'solid-js/store'
import { Dynamic, insert } from 'solid-js/web'

import type { Editor } from './Editor.js'
import { getRenderOwner } from './ReactiveOwner.js'
import {
  SolidNodeViewContextProvider,
  type SolidNodeViewContextProps,
} from './useSolidNodeView.jsx'

export interface SolidNodeViewRendererOptions extends NodeViewRendererOptions {
  as?: string
  className?: string
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

function trackStore<T extends Record<string, unknown>>(store: T): T {
  for (const key in store) {
    store[key]
  }

  return store
}

class SolidNodeView extends NodeView<Component, Editor, SolidNodeViewRendererOptions> {
  private rootElement!: HTMLElement

  private dispose!: () => void

  private store!: Record<string, unknown>

  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  private setProps!: any

  decorationClasses!: string

  /**
   * Holds rich-text content for non-leaf nodes.
   * Created before the Solid component renders so ProseMirror
   * always has a stable contentDOM during the initial DOM build.
   */
  contentDOMElement!: HTMLElement | null

  private currentPos: number | undefined

  private cachedExtensionWithSyncedStorage: NodeViewProps['extension'] | null = null

  constructor(
    component: Component,
    props: NodeViewRendererProps,
    options?: Partial<SolidNodeViewRendererOptions>,
  ) {
    super(component, props, options)

    if (this.options.trackNodeViewPosition) {
      this.editor.on('update', this.handlePositionUpdate)
    }
  }

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
    if (!this.node.isLeaf) {
      this.contentDOMElement = document.createElement(this.node.isInline ? 'span' : 'div')
      this.contentDOMElement.style.whiteSpace = 'inherit'
      this.contentDOMElement.dataset.nodeViewContentSolid = ''
    }

    const onDragStart = this.onDragStart.bind(this)

    const nodeViewContentRef = (element: HTMLElement | undefined) => {
      if (!this.contentDOMElement || !element) {
        return
      }

      if (element.firstChild !== this.contentDOMElement) {
        if (element.hasAttribute('data-node-view-wrapper')) {
          element.removeAttribute('data-node-view-wrapper')
        }

        element.appendChild(this.contentDOMElement)
      }
    }

    this.decorationClasses = this.getDecorationClasses()

    const self = this
    const contextValue: SolidNodeViewContextProps = {
      onDragStart,
      nodeViewContentRef,
      get decorationClasses() {
        return self.decorationClasses
      },
    }

    const as = this.options.as ?? (this.node.isInline ? 'span' : 'div')
    const { className = '' } = this.options

    this.rootElement = document.createElement(as)

    if (className) {
      this.rootElement.classList.add(...className.split(' '))
    }

    this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this)
    this.editor.on('selectionUpdate', this.handleSelectionUpdate)
    this.editor.on('update', this.syncNodeFromDoc)

    this.currentPos = this.getPos()

    createRoot(dispose => {
      const [props, setProps] = createStore({
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
      })

      this.store = props
      this.setProps = setProps
      this.dispose = dispose

      insert(this.rootElement, () => (
        <SolidNodeViewContextProvider value={contextValue}>
          <Dynamic component={this.component} {...trackStore(props)} />
        </SolidNodeViewContextProvider>
      ))
    }, getRenderOwner(this.editor))

    if (this.contentDOMElement) {
      const contentTarget = this.rootElement.querySelector('[data-node-view-content]')

      if (contentTarget) {
        contentTarget.appendChild(this.contentDOMElement)
      }
    }
  }

  private syncNodeFromDoc = () => {
    const pos = this.getPos()

    if (typeof pos !== 'number') {
      return
    }

    const docNode = this.editor.state.doc.nodeAt(pos)

    if (!docNode || docNode === this.node) {
      return
    }

    this.node = docNode
    this.setProps({ node: docNode })
  }

  private handlePositionUpdate = () => {
    const newPos = this.getPos()

    if (typeof newPos !== 'number' || newPos === this.currentPos) {
      return
    }

    this.currentPos = newPos
    this.setProps({ getPos: () => this.getPos() })
  }

  get dom() {
    if (!this.rootElement.firstElementChild?.hasAttribute('data-node-view-wrapper')) {
      throw Error('Please use the NodeViewWrapper component for your node view.')
    }

    return this.rootElement
  }

  get contentDOM() {
    if (this.node.isLeaf) {
      return null
    }

    return this.contentDOMElement
  }

  handleSelectionUpdate() {
    const pos = this.getPos()

    if (typeof pos !== 'number') {
      return
    }

    const isSelected = isNodeViewSelected({
      selection: this.editor.state.selection,
      pos,
      nodeSize: this.node.nodeSize,
      selectedOnTextSelection: this.options.selectedOnTextSelection,
    })

    if (isSelected) {
      if (unwrap(this.store).selected) {
        return
      }

      this.selectNode()
    } else {
      if (!unwrap(this.store).selected) {
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
    const rerenderComponent = (extraProps?: Record<string, unknown>) => {
      this.decorationClasses = this.getDecorationClasses()
      this.setProps({
        decorationClasses: this.decorationClasses,
        ...extraProps,
      })
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
    this.currentPos = this.getPos()

    const extraProps: Record<string, unknown> = {
      node,
      decorations,
      innerDecorations,
      extension: this.extensionWithSyncedStorage,
    }

    if (this.options.trackNodeViewPosition) {
      extraProps.getPos = () => this.getPos()
    }

    rerenderComponent(extraProps)

    return true
  }

  selectNode() {
    this.setProps({ selected: true })
    this.rootElement.classList.add('ProseMirror-selectednode')
  }

  deselectNode() {
    this.setProps({ selected: false })
    this.rootElement.classList.remove('ProseMirror-selectednode')
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
    this.editor.off('selectionUpdate', this.handleSelectionUpdate)
    this.editor.off('update', this.syncNodeFromDoc)

    if (this.options.trackNodeViewPosition) {
      this.editor.off('update', this.handlePositionUpdate)
    }

    if (this.rootElement) {
      this.rootElement.textContent = ''
    }

    this.dispose()
    this.contentDOMElement = null
  }
}

export function SolidNodeViewRenderer(
  component: Component,
  options?: Partial<SolidNodeViewRendererOptions>,
): NodeViewRenderer {
  return props => {
    if (!(props.editor as Editor).contentComponent) {
      return {} as unknown as ProseMirrorNodeView
    }

    return new SolidNodeView(component, props, options)
  }
}
