import { BubbleMenuPlugin, BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'
import Vue, { Component, PropType } from 'vue'

export interface BubbleMenuInterface extends Vue {
  pluginKey: BubbleMenuPluginProps['pluginKey'],
  editor: BubbleMenuPluginProps['editor'],
  tippyOptions: BubbleMenuPluginProps['tippyOptions'],
  shouldShow: BubbleMenuPluginProps['shouldShow'],
}

export const BubbleMenu: Component = {
  name: 'BubbleMenu',

  props: {
    pluginKey: {
      type: [String, Object as PropType<Exclude<BubbleMenuPluginProps['pluginKey'], string>>],
      default: 'bubbleMenu',
    },

    editor: {
      type: Object as PropType<BubbleMenuPluginProps['editor']>,
      required: true,
    },

    tippyOptions: {
      type: Object as PropType<BubbleMenuPluginProps['tippyOptions']>,
      default: () => ({}),
    },

    shouldShow: {
      type: Function as PropType<Exclude<BubbleMenuPluginProps['shouldShow'], null>>,
      default: null,
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

  render(this: BubbleMenuInterface, createElement) {
    return createElement('div', { style: { visibility: 'hidden' } }, this.$slots.default)
  },

  beforeDestroy(this: BubbleMenuInterface) {
    this.editor.unregisterPlugin(this.pluginKey)
  },
}
