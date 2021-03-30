import { Extension } from '@tiptap/core'
import { BubbleMenuPlugin } from './bubble-menu-plugin'

export interface BubbleMenuOptions {
  element: HTMLElement,
  keepInBounds: boolean,
}

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
