import { Extension } from '@tiptap/core'

import type { BubbleMenuPluginProps } from './bubble-menu-plugin.js'
import { BubbleMenuPlugin } from './bubble-menu-plugin.js'

export type BubbleMenuOptions = Omit<BubbleMenuPluginProps, 'editor' | 'element'> & {
  /**
   * The DOM element that contains your menu.
   * @type {HTMLElement}
   * @default null
   */
  element: HTMLElement | null
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bubbleMenu: {
      /**
       * Update the position of the bubble menu. This command is useful to force
       * the bubble menu to update its position in response to certain events
       * (for example, when the bubble menu is resized).
       */
      updateBubbleMenuPosition: () => ReturnType
    }
  }
}

/**
 * This extension allows you to create a bubble menu.
 * @see https://tiptap.dev/api/extensions/bubble-menu
 */
export const BubbleMenu = Extension.create<BubbleMenuOptions>({
  name: 'bubbleMenu',

  addOptions() {
    return {
      element: null,
      pluginKey: 'bubbleMenu',
      updateDelay: undefined,
      appendTo: undefined,
      shouldShow: null,
    }
  },

  addProseMirrorPlugins() {
    if (!this.options.element) {
      return []
    }

    return [
      BubbleMenuPlugin({
        pluginKey: this.options.pluginKey,
        editor: this.editor,
        element: this.options.element,
        updateDelay: this.options.updateDelay,
        options: this.options.options,
        appendTo: this.options.appendTo,
        getReferencedVirtualElement: this.options.getReferencedVirtualElement,
        shouldShow: this.options.shouldShow,
      }),
    ]
  },

  addCommands() {
    return {
      updateBubbleMenuPosition:
        () =>
        ({ commands }) => {
          return commands.setMeta('bubbleMenu', 'updatePosition')
        },
    }
  },
})
