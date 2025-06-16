import type { Editor} from '@tiptap/core'
import { Extension } from '@tiptap/core'
import type { Node } from '@tiptap/pm/model'
import type { Props } from 'tippy.js'

import { DragHandlePlugin } from './drag-handle-plugin.js'

export interface DragHandleOptions {
  /**
   * Renders an element that is positioned with tippy.js
   */
  render(): HTMLElement
  /**
   * Options for tippy.js
   */
  tippyOptions?: Partial<Props>
  /**
   * Locks the draghandle in place and visibility
   */
  locked?: boolean
  /**
   * Returns a node or null when a node is hovered over
   */
  onNodeChange?: (options: { node: Node | null; editor: Editor }) => void
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
      tippyOptions: {},
      locked: false,
      onNodeChange: () => {
        return null
      },
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
        tippyOptions: this.options.tippyOptions,
        element,
        editor: this.editor,
        onNodeChange: this.options.onNodeChange,
      }),
    ]
  },
})
