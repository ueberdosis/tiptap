import { BubbleMenuPlugin, BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'
import Vue, { Component, CreateElement, PropType } from 'vue'

export interface BubbleMenuInterface extends Vue {
  pluginKey: BubbleMenuPluginProps['pluginKey']
  editor: BubbleMenuPluginProps['editor']
  updateDelay: BubbleMenuPluginProps['updateDelay']
  resizeDelay: BubbleMenuPluginProps['resizeDelay']
  shouldShow: BubbleMenuPluginProps['shouldShow']
  options: BubbleMenuPluginProps['options']
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

    updateDelay: {
      type: Number as PropType<BubbleMenuPluginProps['updateDelay']>,
    },

    options: {
      type: Object as PropType<BubbleMenuPluginProps['options']>,
      default: {},
    },

    resizeDelay: {
      type: Number as PropType<BubbleMenuPluginProps['resizeDelay']>,
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

        ;(this.$el as HTMLElement).style.visibility = 'hidden'
        ;(this.$el as HTMLElement).style.position = 'absolute'

        this.$el.remove()

        this.$nextTick(() => {
          editor.registerPlugin(
            BubbleMenuPlugin({
              updateDelay: this.updateDelay,
              resizeDelay: this.resizeDelay,
              options: this.options,
              editor,
              element: this.$el as HTMLElement,
              pluginKey: this.pluginKey,
              shouldShow: this.shouldShow,
            }),
          )
        })
      },
    },
  },

  render(this: BubbleMenuInterface, createElement: CreateElement) {
    return createElement('div', { style: { visibility: 'hidden' } }, this.$slots.default)
  },

  beforeDestroy(this: BubbleMenuInterface) {
    this.editor.unregisterPlugin(this.pluginKey)
  },
}
