import Vue, { Component, PropType } from 'vue'
import { BubbleMenuPlugin, BubbleMenuPluginKey, BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'

interface BubleMenuInterface extends Vue {
  tippyOptions: BubbleMenuPluginProps['tippyOptions'],
  editor: BubbleMenuPluginProps['editor']
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
      handler(this: BubleMenuInterface, editor: BubbleMenuPluginProps['editor']) {
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

  render(this: BubleMenuInterface, createElement) {
    return createElement('div', { style: { visibility: 'hidden' } }, this.$slots.default)
  },

  beforeDestroy(this: BubleMenuInterface) {
    this.editor.unregisterPlugin(BubbleMenuPluginKey)
  },
}
