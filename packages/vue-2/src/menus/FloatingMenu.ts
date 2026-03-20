import type { FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'
import { FloatingMenuPlugin } from '@tiptap/extension-floating-menu'
import { PluginKey } from '@tiptap/pm/state'
import type { Component, CreateElement, PropType } from 'vue'
import type Vue from 'vue'

export interface FloatingMenuInterface extends Vue {
  $attrs: Record<string, any>
  $listeners: Record<string, (...args: any[]) => unknown>
  pluginKey: FloatingMenuPluginProps['pluginKey']
  generatedPluginKey?: FloatingMenuPluginProps['pluginKey']
  editor: FloatingMenuPluginProps['editor']
  updateDelay: FloatingMenuPluginProps['updateDelay']
  resizeDelay: FloatingMenuPluginProps['resizeDelay']
  options: FloatingMenuPluginProps['options']
  appendTo: FloatingMenuPluginProps['appendTo']
  shouldShow: FloatingMenuPluginProps['shouldShow']
  getPluginKey: () => FloatingMenuPluginProps['pluginKey']
}

export const FloatingMenu: Component = {
  name: 'FloatingMenu',

  inheritAttrs: false,

  props: {
    pluginKey: {
      type: [String, Object as PropType<Exclude<FloatingMenuPluginProps['pluginKey'], string>>],
      default: undefined,
    },

    editor: {
      type: Object as PropType<FloatingMenuPluginProps['editor']>,
      required: true,
    },

    updateDelay: {
      type: Number as PropType<FloatingMenuPluginProps['updateDelay']>,
    },

    resizeDelay: {
      type: Number as PropType<FloatingMenuPluginProps['resizeDelay']>,
    },

    options: {
      type: Object as PropType<FloatingMenuPluginProps['options']>,
      default: () => ({}),
    },

    appendTo: {
      type: [Object, Function] as PropType<FloatingMenuPluginProps['appendTo']>,
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

        if (!this.$el) {
          return
        }

        ;(this.$el as HTMLElement).style.visibility = 'hidden'
        ;(this.$el as HTMLElement).style.position = 'absolute'

        this.$el.remove()

        this.$nextTick(() => {
          editor.registerPlugin(
            FloatingMenuPlugin({
              pluginKey: this.getPluginKey(),
              editor,
              element: this.$el as HTMLElement,
              updateDelay: this.updateDelay,
              resizeDelay: this.resizeDelay,
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
    const vnodeData = (this.$vnode?.data ?? {}) as any

    return createElement(
      'div',
      {
        attrs: this.$attrs,
        on: this.$listeners,
        class: [vnodeData.staticClass, vnodeData.class],
        style: [vnodeData.staticStyle, vnodeData.style],
      },
      this.$slots.default,
    )
  },

  beforeDestroy(this: FloatingMenuInterface) {
    this.editor.unregisterPlugin(this.getPluginKey())
  },

  methods: {
    getPluginKey(this: FloatingMenuInterface) {
      if (!this.generatedPluginKey) {
        this.generatedPluginKey = this.pluginKey ?? new PluginKey('floatingMenu')
      }

      return this.generatedPluginKey
    },
  },
}
