import Vue, { PropType } from 'vue'
import { FloatingMenuPlugin, FloatingMenuPluginKey, FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'

export const FloatingMenu = Vue.extend({
  name: 'FloatingMenu',

  props: {
    editor: {
      type: Object as PropType<FloatingMenuPluginProps['editor']>,
      required: true,
    },

    tippyOptions: {
      type: Object as PropType<FloatingMenuPluginProps['tippyOptions']>,
      default: () => ({}),
    },
  },

  watch: {
    editor: {
      immediate: true,
      handler(editor: FloatingMenuPluginProps['editor']) {
        if (!editor) {
          return
        }

        this.$nextTick(() => {
          editor.registerPlugin(FloatingMenuPlugin({
            editor,
            element: this.$el as HTMLElement,
            tippyOptions: this.tippyOptions,
          }))
        })
      },
    },
  },

  render(createElement) {
    return createElement('div', { style: { visibility: 'hidden' } }, this.$slots.default)
  },

  beforeDestroy() {
    this.editor.unregisterPlugin(FloatingMenuPluginKey)
  },
})
