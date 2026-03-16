import type { BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import { PluginKey } from '@tiptap/pm/state'
import type { Component, CreateElement, PropType, VNode } from 'vue'

export interface BubbleMenuInterface {
  $el: HTMLElement
  $attrs: Record<string, any>
  $listeners: Record<string, (...args: any[]) => unknown>
  $nextTick: (callback: () => void) => void
  $slots: { default?: VNode[] }
  $vnode?: VNode
  pluginKey: BubbleMenuPluginProps['pluginKey']
  generatedPluginKey?: BubbleMenuPluginProps['pluginKey']
  editor: BubbleMenuPluginProps['editor']
  updateDelay: BubbleMenuPluginProps['updateDelay']
  resizeDelay: BubbleMenuPluginProps['resizeDelay']
  appendTo: BubbleMenuPluginProps['appendTo']
  shouldShow: BubbleMenuPluginProps['shouldShow']
  getReferencedVirtualElement: BubbleMenuPluginProps['getReferencedVirtualElement']
  options: BubbleMenuPluginProps['options']
  getPluginKey: () => BubbleMenuPluginProps['pluginKey']
}

export const BubbleMenu: Component = {
  name: 'BubbleMenu',

  inheritAttrs: false,

  props: {
    pluginKey: {
      type: [String, Object as PropType<Exclude<BubbleMenuPluginProps['pluginKey'], string>>],
      default: undefined,
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
      default: () => ({}),
    },

    resizeDelay: {
      type: Number as PropType<BubbleMenuPluginProps['resizeDelay']>,
    },

    appendTo: {
      type: [Object, Function] as PropType<BubbleMenuPluginProps['appendTo']>,
      default: undefined,
    },

    shouldShow: {
      type: Function as PropType<Exclude<BubbleMenuPluginProps['shouldShow'], null>>,
      default: null,
    },
  },

  mounted(this: BubbleMenuInterface) {
    const editor = this.editor
    const el = this.$el as HTMLElement

    if (!editor || !el) {
      return
    }

    el.style.visibility = 'hidden'
    el.style.position = 'absolute'

    // Remove element from DOM; plugin will re-parent it when shown
    el.remove()

    this.$nextTick(() => {
      editor.registerPlugin(
        BubbleMenuPlugin({
          updateDelay: this.updateDelay,
          resizeDelay: this.resizeDelay,
          options: this.options,
          editor,
          element: el,
          pluginKey: this.getPluginKey(),
          appendTo: this.appendTo,
          shouldShow: this.shouldShow,
          getReferencedVirtualElement: this.getReferencedVirtualElement,
        }),
      )
    })
  },

  render(this: BubbleMenuInterface, createElement: CreateElement) {
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

  beforeDestroy(this: BubbleMenuInterface) {
    this.editor.unregisterPlugin(this.getPluginKey())
  },

  methods: {
    getPluginKey(this: BubbleMenuInterface) {
      if (!this.generatedPluginKey) {
        this.generatedPluginKey = this.pluginKey ?? new PluginKey('bubbleMenu')
      }

      return this.generatedPluginKey
    },
  },
}
