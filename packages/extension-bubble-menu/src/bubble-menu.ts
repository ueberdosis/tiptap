import { Extension } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'

import type { BubbleMenuPluginProps } from './bubble-menu-plugin.js'
import { BubbleMenuPlugin } from './bubble-menu-plugin.js'

export type BubbleMenuOptions = Omit<BubbleMenuPluginProps, 'editor' | 'element' | 'pluginKey'> & {
  /**
   * The DOM element that contains your menu.
   * @type {HTMLElement}
   * @default null
   */
  element: HTMLElement | null
  /**
   * The plugin key or plugin key string.
   * @default 'bubbleMenu'
   */
  pluginKey: PluginKey | string
}

export interface BubbleMenuStorage {
  /**
   * The plugin key.
   */
  pluginKey: PluginKey
}

declare module '@tiptap/core' {
  interface Storage {
    bubbleMenu: BubbleMenuStorage
  }

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
export const BubbleMenu = Extension.create<BubbleMenuOptions, BubbleMenuStorage>({
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

  addStorage() {
    return {
      pluginKey:
        typeof this.options.pluginKey === 'string' ? new PluginKey(this.options.pluginKey) : this.options.pluginKey,
    }
  },

  addProseMirrorPlugins() {
    if (!this.options.element) {
      return []
    }

    return [
      BubbleMenuPlugin({
        pluginKey: this.storage.pluginKey,
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
          return commands.setMeta(this.storage.pluginKey, 'updatePosition')
        },
    }
  },
})
