import { Extension } from '@tiptap/core'
import { EditorView } from 'prosemirror-view'
import { BubbleMenuPlugin, BubbleMenuPluginProps } from './bubble-menu-plugin'

export type BubbleMenuOptions = Omit<BubbleMenuPluginProps, 'editor' | 'element'> & {
  element: HTMLElement | null,
}

export type ShouldShow = (view?: EditorView) => boolean

export const BubbleMenu = Extension.create<BubbleMenuOptions>({
  name: 'bubbleMenu',

  defaultOptions: {
    element: null,
    tippyOptions: {},
    shouldShow: () => true,
  },

  addProseMirrorPlugins() {
    if (!this.options.element) {
      return []
    }

    return [
      BubbleMenuPlugin({
        editor: this.editor,
        element: this.options.element,
        tippyOptions: this.options.tippyOptions,
        shouldShow: this.options.shouldShow,
      }),
    ]
  },
})
