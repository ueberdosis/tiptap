import Vue, { Component, PropType } from 'vue'
import { BubbleMenuPlugin, BubbleMenuPluginKey, BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'

export interface BubbleMenuInterface extends Vue {
  tippyOptions: BubbleMenuPluginProps['tippyOptions'],
  editor: BubbleMenuPluginProps['editor'],
}

export const BubbleMenu: Component = {
  name: 'BubbleMenu',

  props: {
    editor: {
      type: Object as PropType<BubbleMenuPluginProps['editor']>,
      required: true,
    },

    tippyOptions: {
      type: Object as PropType<BubbleMenuPluginProps['tippyOptions']>,
      default: () => ({}),
    },
  },

  watch: {
    editor: {
      immediate: true,
      handler(this: BubbleMenuInterface, editor: BubbleMenuPluginProps['editor']) {
        if (!editor) {
          return
        }

        this.$nextTick(() => {
          editor.registerPlugin(BubbleMenuPlugin({
            editor,
            element: this.$el as HTMLElement,
            tippyOptions: this.tippyOptions,
          }))
        })
      },
    },
  },

  render(this: BubbleMenuInterface, createElement) {
    return createElement('div', { style: { visibility: 'hidden' } }, this.$slots.default)
  },

  beforeDestroy(this: BubbleMenuInterface) {
    this.editor.unregisterPlugin(BubbleMenuPluginKey)
  },
}
