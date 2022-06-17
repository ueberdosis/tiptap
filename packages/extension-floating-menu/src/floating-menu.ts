import { Extension } from '@tiptap/core'

import { FloatingMenuPlugin, FloatingMenuPluginProps } from './floating-menu-plugin'

export type FloatingMenuOptions = Omit<FloatingMenuPluginProps, 'editor' | 'element'> & {
  element: HTMLElement | null,
}

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
