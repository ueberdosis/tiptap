import Vue, { PropType } from 'vue'
import { BubbleMenuPlugin, BubbleMenuPluginKey, BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'

export const BubbleMenu = Vue.extend({
  name: 'BubbleMenu',

  props: {
    editor: {
      type: Object as PropType<BubbleMenuPluginProps['editor']>,
      required: true,
    },
  },

  watch: {
    editor: {
      immediate: true,
      handler(editor: BubbleMenuPluginProps['editor']) {
        if (!editor) {
          return
        }

        this.$nextTick(() => {
          editor.registerPlugin(BubbleMenuPlugin({
            editor,
            element: this.$el as HTMLElement,
          }))
        })
      },
    },
  },

  render(createElement) {
    return createElement('div', { style: { visibility: 'hidden' } }, this.$slots.default)
  },

  beforeDestroy() {
    this.editor.unregisterPlugin(BubbleMenuPluginKey)
  },
})
