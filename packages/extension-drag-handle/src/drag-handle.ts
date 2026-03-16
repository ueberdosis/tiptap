import type { ComputePositionConfig, VirtualElement } from '@floating-ui/dom'
import { type Editor, Extension } from '@tiptap/core'
import type { Node } from '@tiptap/pm/model'

import { DragHandlePlugin } from './drag-handle-plugin.js'
import { normalizeNestedOptions } from './helpers/normalizeOptions.js'
import type { NestedOptions } from './types/options.js'

export const defaultComputePositionConfig: ComputePositionConfig = {
  placement: 'left-start',
  strategy: 'absolute',
}

export interface DragHandleOptions {
  /**
   * Renders an element that is positioned with the floating-ui/dom package
   */
  render(): HTMLElement
  /**
   * Configuration for position computation of the drag handle
   * using the floating-ui/dom package
   */
  computePositionConfig?: ComputePositionConfig
  /**
   * A function that returns the virtual element for the drag handle.
   * This is useful when the menu needs to be positioned relative to a specific DOM element.
   */
  getReferencedVirtualElement?: () => VirtualElement | null
  /**
   * Locks the draghandle in place and visibility
   */
  locked?: boolean
  /**
   * Returns a node or null when a node is hovered over
   */
  onNodeChange?: (options: { node: Node | null; editor: Editor }) => void
  /**
   * The callback function that will be called when drag start.
   */
  onElementDragStart?: (e: DragEvent) => void
  /**
   * The callback function that will be called when drag end.
   */
  onElementDragEnd?: (e: DragEvent) => void
  /**
   * Enable drag handles for nested content (list items, blockquotes, etc.).
   *
   * When enabled, the drag handle will appear for nested blocks, not just
   * top-level blocks. A rule-based scoring system determines which node
   * to target based on cursor position and configured rules.
   *
   * **Values:**
   * - `false` (default): Only root-level blocks show drag handles
   * - `true`: Enable with sensible defaults (left edge detection, default rules)
   * - `NestedOptions`: Enable with custom configuration
   *
   * **Configuration options:**
   * - `rules`: Custom rules to determine which nodes are draggable
   * - `defaultRules`: Whether to include default rules (default: true)
   * - `allowedContainers`: Restrict nested dragging to specific container types
   * - `edgeDetection`: Control when to prefer parent over nested node
   *   - `'left'` (default): Prefer parent near left/top edges
   *   - `'right'`: Prefer parent near right/top edges (for RTL)
   *   - `'both'`: Prefer parent near any horizontal edge
   *   - `'none'`: Disable edge detection
   *
   * @default false
   *
   * @example
   * // Simple enable with sensible defaults
   * DragHandle.configure({
   *   nested: true,
   * })
   *
   * @example
   * // Restrict to specific containers
   * DragHandle.configure({
   *   nested: {
   *     allowedContainers: ['bulletList', 'orderedList'],
   *   },
   * })
   *
   * @example
   * // With custom rules
   * DragHandle.configure({
   *   nested: {
   *     rules: [{
   *       id: 'excludeCodeBlocks',
   *       evaluate: ({ node }) => node.type.name === 'codeBlock' ? 1000 : 0,
   *     }],
   *     edgeDetection: 'none',
   *   },
   * })
   */
  nested?: boolean | NestedOptions
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dragHandle: {
      /**
       * Locks the draghandle in place and visibility
       */
      lockDragHandle: () => ReturnType
      /**
       * Unlocks the draghandle
       */
      unlockDragHandle: () => ReturnType
      /**
       * Toggle draghandle lock state
       */
      toggleDragHandle: () => ReturnType
    }
  }
}

export const DragHandle = Extension.create<DragHandleOptions>({
  name: 'dragHandle',

  addOptions() {
    return {
      render() {
        const element = document.createElement('div')

        element.classList.add('drag-handle')

        return element
      },
      computePositionConfig: {},
      locked: false,
      onNodeChange: () => {
        return null
      },
      onElementDragStart: undefined,
      onElementDragEnd: undefined,
      nested: false,
    }
  },

  addCommands() {
    return {
      lockDragHandle:
        () =>
        ({ editor }) => {
          this.options.locked = true
          return editor.commands.setMeta('lockDragHandle', this.options.locked)
        },
      unlockDragHandle:
        () =>
        ({ editor }) => {
          this.options.locked = false
          return editor.commands.setMeta('lockDragHandle', this.options.locked)
        },
      toggleDragHandle:
        () =>
        ({ editor }) => {
          this.options.locked = !this.options.locked
          return editor.commands.setMeta('lockDragHandle', this.options.locked)
        },
    }
  },

  addProseMirrorPlugins() {
    const element = this.options.render()
    const nestedOptions = normalizeNestedOptions(this.options.nested)

    return [
      DragHandlePlugin({
        computePositionConfig: { ...defaultComputePositionConfig, ...this.options.computePositionConfig },
        getReferencedVirtualElement: this.options.getReferencedVirtualElement,
        element,
        editor: this.editor,
        onNodeChange: this.options.onNodeChange,
        onElementDragStart: this.options.onElementDragStart,
        onElementDragEnd: this.options.onElementDragEnd,
        nestedOptions,
      }).plugin,
    ]
  },
})
