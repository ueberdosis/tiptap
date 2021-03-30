import { Extension } from '@tiptap/core'
import { BubbleMenuPlugin } from './bubble-menu-plugin'

export interface BubbleMenuOptions {
  element: HTMLElement,
  keepInBounds: boolean,
  onUpdate: () => void,
}

export const BubbleMenu = Extension.create<BubbleMenuOptions>({
  name: 'bubbleMenu',

  defaultOptions: {
    element: document.createElement('div'),
    keepInBounds: true,
    onUpdate: () => ({}),
  },

  addProseMirrorPlugins() {
    return [
      BubbleMenuPlugin({
        editor: this.editor,
        element: this.options.element,
        keepInBounds: this.options.keepInBounds,
        onUpdate: this.options.onUpdate,
      }),
    ]
  },
})
