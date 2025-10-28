import type { ComputePositionConfig, VirtualElement } from '@floating-ui/dom'
import { type Editor, Extension } from '@tiptap/core'
import type { Node } from '@tiptap/pm/model'

import { DragHandlePlugin } from './drag-handle-plugin.js'

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

    return [
      DragHandlePlugin({
        computePositionConfig: { ...defaultComputePositionConfig, ...this.options.computePositionConfig },
        getReferencedVirtualElement: this.options.getReferencedVirtualElement,
        element,
        editor: this.editor,
        onNodeChange: this.options.onNodeChange,
        onElementDragStart: this.options.onElementDragStart,
        onElementDragEnd: this.options.onElementDragEnd,
      }).plugin,
    ]
  },
})
