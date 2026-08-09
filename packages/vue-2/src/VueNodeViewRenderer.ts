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
import type { VueConstructor } from 'vue'
import { booleanProp, functionProp, objectProp } from 'vue-ts-types'

import type { Editor } from './Editor.js'
import { Vue } from './Vue.js'
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

class VueNodeView extends NodeView<Vue | VueConstructor, Editor, VueNodeViewRendererOptions> {
  renderer!: VueRenderer

  decorationClasses!: {
    value: string
  }

  /**
   * The element that holds the rich-text content of the node.
   * Always created for non-leaf nodes to guarantee a valid contentDOM,
   * even when the user's component does not include a NodeViewContent.
   * Must NOT have an initializer because class field initializers run
   * after super() and would overwrite the value set by mount().
   */
  contentDOMElement!: HTMLElement | null

  private currentPos: number | undefined

  constructor(
    component: Vue | VueConstructor,
    props: NodeViewRendererProps,
    options?: Partial<VueNodeViewRendererOptions>,
  ) {
    super(component, props, options)

    if (this.options.trackNodeViewPosition) {
      this.editor.on('update', this.handlePositionUpdate)
    }
  }

  private handlePositionUpdate = () => {
    const newPos = this.getPos()
    if (typeof newPos !== 'number' || newPos === this.currentPos) {
      return
    }
    this.currentPos = newPos
    this.renderer.updateProps({ getPos: () => this.getPos() })
  }

  /**
   * Called when the node view is mounted.
   */
  mount() {
    const props: Record<string, any> = {
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
    }

    const mountProps = props as NodeViewProps

    const onDragStart = this.onDragStart.bind(this)

    this.decorationClasses = Vue.observable({
      value: this.getDecorationClasses(),
    })

    // @ts-ignore
    const vue = this.editor.contentComponent?.$options._base ?? Vue // oxlint-disable-line

    const Component = vue.extend(this.component).extend({
      props: Object.keys(props),
      provide: () => {
        return {
          onDragStart,
          decorationClasses: this.decorationClasses,
          nodeViewContentRef: (el: HTMLElement | null) => {
            if (!this.contentDOMElement) return

            if (el && el.firstChild !== this.contentDOMElement) {
              // NodeViewContent mounted: move the contentDOMElement inside it
              el.appendChild(this.contentDOMElement)
            }
          },
        }
      },
    })

    this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this)
    this.editor.on('selectionUpdate', this.handleSelectionUpdate)

    this.currentPos = this.getPos()

    if (!this.node.isLeaf) {
      if (this.options.contentDOMElementTag) {
        this.contentDOMElement = document.createElement(this.options.contentDOMElementTag)
      } else {
        this.contentDOMElement = document.createElement(this.node.isInline ? 'span' : 'div')
      }
      this.contentDOMElement.style.whiteSpace = 'inherit'
      // Use a distinct attribute to avoid clashing with the user's
      // <node-view-content> element (which carries data-node-view-content).
      // Matches React's data-node-view-content-react convention.
      this.contentDOMElement.dataset.nodeViewContentVue = ''
    }

    this.renderer = new VueRenderer(Component, {
      parent: this.editor.contentComponent,
      propsData: mountProps,
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

    return this.contentDOMElement
  }

  /**
   * On editor selection update, check if the node is selected.
   * If it is, call `selectNode`, otherwise call `deselectNode`.
   */
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

    const nodeChanged = node !== this.node

    // Node reference unchanged — only decorations may have changed.
    // ProseMirror renders decorations independently on the contentDOM,
    // and the getPos closure (bound in mount()) calls through to
    // ProseMirror's position function at call time, so it is always
    // current. Update internal refs, refresh decoration classes for
    // the wrapper component, and skip the Vue re-render.
    if (!nodeChanged) {
      this.node = node
      this.decorations = decorations
      this.innerDecorations = innerDecorations
      this.decorationClasses.value = this.getDecorationClasses()
      return true
    }

    this.node = node
    this.decorations = decorations
    this.innerDecorations = innerDecorations
    this.currentPos = this.getPos()

    const extraProps: Record<string, any> = {
      node,
      decorations,
      innerDecorations,
    }

    if (this.options.trackNodeViewPosition) {
      extraProps.getPos = () => this.getPos()
    }

    rerenderComponent(extraProps)

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
        .flatMap(item => item.type.attrs.class)
        .join(' ')
    )
  }

  destroy() {
    this.renderer.destroy()
    this.editor.off('selectionUpdate', this.handleSelectionUpdate)

    if (this.options.trackNodeViewPosition) {
      this.editor.off('update', this.handlePositionUpdate)
    }

    this.contentDOMElement = null
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
