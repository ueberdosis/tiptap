import Vue, { Component, PropType } from 'vue'
import { FloatingMenuPlugin, FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'

export interface FloatingMenuInterface extends Vue {
  pluginKey: FloatingMenuPluginProps['pluginKey'],
  tippyOptions: FloatingMenuPluginProps['tippyOptions'],
  editor: FloatingMenuPluginProps['editor'],
  shouldShow: FloatingMenuPluginProps['shouldShow'],
}

export const FloatingMenu: Component = {
  name: 'FloatingMenu',

  props: {
    pluginKey: {
      type: [String, Object as PropType<Exclude<FloatingMenuPluginProps['pluginKey'], string>>],
      default: 'floatingMenu',
    },

    editor: {
      type: Object as PropType<FloatingMenuPluginProps['editor']>,
      required: true,
    },

    tippyOptions: {
      type: Object as PropType<FloatingMenuPluginProps['tippyOptions']>,
      default: () => ({}),
    },

    shouldShow: {
      type: Function as PropType<Exclude<FloatingMenuPluginProps['shouldShow'], null>>,
      default: null,
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
            pluginKey: this.pluginKey,
            editor,
            element: this.$el as HTMLElement,
            tippyOptions: this.tippyOptions,
            shouldShow: this.shouldShow,
          }))
        })
      },
    },
  },

  render(this: FloatingMenuInterface, createElement) {
    return createElement('div', { style: { visibility: 'hidden' } }, this.$slots.default)
  },

  beforeDestroy(this: FloatingMenuInterface) {
    this.editor.unregisterPlugin(this.pluginKey)
  },
}
