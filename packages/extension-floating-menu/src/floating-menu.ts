import { Extension } from '@tiptap/core'

import { FloatingMenuPlugin, FloatingMenuPluginProps } from './floating-menu-plugin.js'

export type FloatingMenuOptions = Omit<FloatingMenuPluginProps, 'editor' | 'element'> & {
  /**
   * The DOM element that contains your menu.
   * @type {HTMLElement}
   * @default null
   */
  element: HTMLElement | null,
}

/**
 * This extension allows you to create a floating menu.
 * @see https://tiptap.dev/api/extensions/floating-menu
 */
export const FloatingMenu = Extension.create<FloatingMenuOptions>({
  name: 'floatingMenu',

  addOptions() {
    return {
      element: null,
      tippyOptions: {},
      pluginKey: 'floatingMenu',
      shouldShow: null,
    }
  },

  addProseMirrorPlugins() {
    if (!this.options.element) {
      return []
    }

    return [
      FloatingMenuPlugin({
        pluginKey: this.options.pluginKey,
        editor: this.editor,
        element: this.options.element,
        tippyOptions: this.options.tippyOptions,
        shouldShow: this.options.shouldShow,
      }),
    ]
  },
})
