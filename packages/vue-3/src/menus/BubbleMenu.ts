import type { BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import type { PropType } from 'vue'
import { defineComponent, h, onBeforeUnmount, onMounted, ref, Teleport } from 'vue'

export const BubbleMenu = defineComponent({
  name: 'BubbleMenu',

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

    shouldShow: {
      type: Function as PropType<Exclude<Required<BubbleMenuPluginProps>['shouldShow'], null>>,
      default: null,
    },
  },

  setup(props, { slots }) {
    const root = ref<HTMLElement | null>(null)

    onMounted(() => {
      const { editor, options, pluginKey, resizeDelay, shouldShow, updateDelay } = props

      if (!root.value) {
        return
      }

      root.value.style.visibility = 'hidden'
      root.value.style.position = 'absolute'

      // remove the element from the DOM
      root.value.remove()

      editor.registerPlugin(
        BubbleMenuPlugin({
          editor,
          element: root.value as HTMLElement,
          options,
          pluginKey,
          resizeDelay,
          shouldShow,
          updateDelay,
        }),
      )
    })

    onBeforeUnmount(() => {
      const { pluginKey, editor } = props

      editor.unregisterPlugin(pluginKey)
    })

    return () => h(Teleport, { to: 'body' }, h('div', { ref: root }, slots.default?.()))
  },
})
