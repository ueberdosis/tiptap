import { Extension } from '@tiptap/core'
import { BubbleMenuPlugin, BubbleMenuPluginProps } from './bubble-menu-plugin'

export type BubbleMenuOptions = Omit<BubbleMenuPluginProps, 'editor' | 'element'> & {
  element: HTMLElement | null,
}

export const BubbleMenu = Extension.create<BubbleMenuOptions>({
  name: 'bubbleMenu',

  defaultOptions: {
    element: null,
    tippyOptions: {},
    key: 'bubbleMenu',
    shouldShow: null,
  },

  addProseMirrorPlugins() {
    if (!this.options.element) {
      return []
    }

    return [
      BubbleMenuPlugin({
        key: this.options.key,
        editor: this.editor,
        element: this.options.element,
        tippyOptions: this.options.tippyOptions,
        shouldShow: this.options.shouldShow,
      }),
    ]
  },
})
