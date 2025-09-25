import type { BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import type { PropType } from 'vue'
import { defineComponent, h, onBeforeUnmount, onMounted, ref, Teleport } from 'vue'

export const BubbleMenu = defineComponent({
  name: 'BubbleMenu',

  inheritAttrs: false,

  props: {
    pluginKey: {
      type: [String, Object] as PropType<BubbleMenuPluginProps['pluginKey']>,
      default: 'bubbleMenu',
    },

    editor: {
      type: Object as PropType<BubbleMenuPluginProps['editor']>,
      required: true,
    },

    updateDelay: {
      type: Number as PropType<BubbleMenuPluginProps['updateDelay']>,
      default: undefined,
    },

    resizeDelay: {
      type: Number as PropType<BubbleMenuPluginProps['resizeDelay']>,
      default: undefined,
    },

    options: {
      type: Object as PropType<BubbleMenuPluginProps['options']>,
      default: () => ({}),
    },

    appendTo: {
      type: Object as PropType<BubbleMenuPluginProps['appendTo']>,
      default: undefined,
    },

    shouldShow: {
      type: Function as PropType<Exclude<Required<BubbleMenuPluginProps>['shouldShow'], null>>,
      default: null,
    },

    getReferencedVirtualElement: {
      type: Function as PropType<Exclude<Required<BubbleMenuPluginProps>['getReferencedVirtualElement'], null>>,
      default: undefined,
    },
  },

  setup(props, { slots, attrs }) {
    const root = ref<HTMLElement | null>(null)

    onMounted(() => {
      const {
        editor,
        options,
        pluginKey,
        resizeDelay,
        appendTo,
        shouldShow,
        getReferencedVirtualElement,
        updateDelay,
      } = props

      if (!root.value) {
        return
      }

      root.value.style.visibility = 'hidden'
      root.value.style.position = 'absolute'

      // Remove element from DOM; plugin will re-parent it when shown
      root.value.remove()

      editor.registerPlugin(
        BubbleMenuPlugin({
          editor,
          element: root.value as HTMLElement,
          options,
          pluginKey,
          resizeDelay,
          appendTo,
          shouldShow,
          getReferencedVirtualElement,
          updateDelay,
        }),
      )
    })

    onBeforeUnmount(() => {
      const { pluginKey, editor } = props

      editor.unregisterPlugin(pluginKey)
    })

    // Teleport only instantiates element + slot subtree; plugin controls final placement
    return () => h(Teleport, { to: 'body' }, h('div', { ...attrs, ref: root }, slots.default?.()))
  },
})
