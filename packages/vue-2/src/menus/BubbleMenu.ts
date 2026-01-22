import type { BubbleMenuPluginProps } from '@dibdab/extension-bubble-menu'
import { BubbleMenuPlugin } from '@dibdab/extension-bubble-menu'
import type { Component, CreateElement, PropType, VNode } from 'vue'

export interface BubbleMenuInterface {
  $el: HTMLElement
  $nextTick: (callback: () => void) => void
  $slots: { default?: VNode[] }
  pluginKey: BubbleMenuPluginProps['pluginKey']
  editor: BubbleMenuPluginProps['editor']
  updateDelay: BubbleMenuPluginProps['updateDelay']
  resizeDelay: BubbleMenuPluginProps['resizeDelay']
  appendTo: BubbleMenuPluginProps['appendTo']
  shouldShow: BubbleMenuPluginProps['shouldShow']
  getReferencedVirtualElement: BubbleMenuPluginProps['getReferencedVirtualElement']
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
          pluginKey: this.pluginKey,
          appendTo: this.appendTo,
          shouldShow: this.shouldShow,
          getReferencedVirtualElement: this.getReferencedVirtualElement,
        }),
      )
    })
  },

  render(this: BubbleMenuInterface, createElement: CreateElement) {
    return createElement('div', {}, this.$slots.default)
  },

  beforeDestroy(this: BubbleMenuInterface) {
    this.editor.unregisterPlugin(this.pluginKey)
  },
}
