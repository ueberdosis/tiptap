import { Extension } from '@tiptap/core'

import { BubbleMenuPlugin, BubbleMenuPluginProps } from './bubble-menu-plugin.js'

export type BubbleMenuOptions = Omit<BubbleMenuPluginProps, 'editor' | 'element'> & {
  /**
   * The DOM element that contains your menu.
   * @type {HTMLElement}
   * @default null
   */
  element: HTMLElement | null,
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
      tippyOptions: {},
      pluginKey: 'bubbleMenu',
      updateDelay: undefined,
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
        tippyOptions: this.options.tippyOptions,
        updateDelay: this.options.updateDelay,
        shouldShow: this.options.shouldShow,
      }),
    ]
  },
})
