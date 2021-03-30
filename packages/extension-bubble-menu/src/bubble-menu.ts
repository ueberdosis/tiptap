import { Extension } from '@tiptap/core'
import { BubbleMenuPlugin, BubbleMenuPluginOptions } from './bubble-menu-plugin'

export type BubbleMenuOptions = Omit<BubbleMenuPluginOptions, 'editor'>

export const BubbleMenu = Extension.create<BubbleMenuOptions>({
  name: 'bubbleMenu',

  defaultOptions: {
    element: document.createElement('div'),
    keepInBounds: true,
  },

  addProseMirrorPlugins() {
    return [
      BubbleMenuPlugin({
        editor: this.editor,
        element: this.options.element,
        keepInBounds: this.options.keepInBounds,
      }),
    ]
  },
})
