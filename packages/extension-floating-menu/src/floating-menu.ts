import { Extension } from '@tiptap/core'
import { FloatingMenuPlugin, FloatingMenuPluginProps } from './floating-menu-plugin'

export type FloatingMenuOptions = Omit<FloatingMenuPluginProps, 'editor' | 'element'> & {
  element: HTMLElement | null,
}

export const FloatingMenu = Extension.create<FloatingMenuOptions>({
  name: 'bubbleMenu',

  defaultOptions: {
    element: null,
  },

  addProseMirrorPlugins() {
    if (!this.options.element) {
      return []
    }

    return [
      FloatingMenuPlugin({
        editor: this.editor,
        element: this.options.element,
      }),
    ]
  },
})
