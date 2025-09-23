import type { FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'
import { FloatingMenuPlugin } from '@tiptap/extension-floating-menu'
import type { Component, CreateElement, PropType } from 'vue'
import type Vue from 'vue'

export interface FloatingMenuInterface extends Vue {
  pluginKey: FloatingMenuPluginProps['pluginKey']
  options: FloatingMenuPluginProps['options']
  editor: FloatingMenuPluginProps['editor']
  appendTo: FloatingMenuPluginProps['appendTo']
  shouldShow: FloatingMenuPluginProps['shouldShow']
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

    options: {
      type: Object as PropType<FloatingMenuPluginProps['options']>,
      default: () => ({}),
    },

    appendTo: {
      type: Object as PropType<FloatingMenuPluginProps['appendTo']>,
      default: undefined,
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

        ;(this.$el as HTMLElement).style.visibility = 'hidden'
        ;(this.$el as HTMLElement).style.position = 'absolute'

        this.$el.remove()

        this.$nextTick(() => {
          editor.registerPlugin(
            FloatingMenuPlugin({
              pluginKey: this.pluginKey,
              editor,
              element: this.$el as HTMLElement,
              options: this.options,
              appendTo: this.appendTo,
              shouldShow: this.shouldShow,
            }),
          )
        })
      },
    },
  },

  render(this: FloatingMenuInterface, createElement: CreateElement) {
    return createElement('div', {}, this.$slots.default)
  },

  beforeDestroy(this: FloatingMenuInterface) {
    this.editor.unregisterPlugin(this.pluginKey)
  },
}
