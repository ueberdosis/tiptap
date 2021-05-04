import Vue, { Component, PropType } from 'vue'
import { FloatingMenuPlugin, FloatingMenuPluginKey, FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'

interface FloatingMenuInterface extends Vue {
  tippyOptions: FloatingMenuPluginProps['tippyOptions'],
  editor: FloatingMenuPluginProps['editor']
}

export const FloatingMenu: Component = {
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
      handler(this: FloatingMenuInterface, editor: FloatingMenuPluginProps['editor']) {
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

  render(this: FloatingMenuInterface, createElement) {
    return createElement('div', { style: { visibility: 'hidden' } }, this.$slots.default)
  },

  beforeDestroy(this: FloatingMenuInterface) {
    this.editor.unregisterPlugin(FloatingMenuPluginKey)
  },
}
