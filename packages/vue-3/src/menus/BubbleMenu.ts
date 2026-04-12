import type { BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import { PluginKey } from '@tiptap/pm/state'
import type { PropType } from 'vue'
import { defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

export const BubbleMenu = defineComponent({
  name: 'BubbleMenu',

  inheritAttrs: false,

  props: {
    pluginKey: {
      type: [String, Object] as PropType<BubbleMenuPluginProps['pluginKey']>,
      default: undefined,
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
      type: [Object, Function] as PropType<BubbleMenuPluginProps['appendTo']>,
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
    const resolvedPluginKey = props.pluginKey ?? new PluginKey('bubbleMenu')

    onMounted(() => {
      const { editor, options, resizeDelay, appendTo, shouldShow, getReferencedVirtualElement, updateDelay } = props

      const el = root.value

      if (!el) {
        return
      }

      el.style.visibility = 'hidden'
      el.style.position = 'absolute'

      // Remove element from DOM; plugin will re-parent it when shown
      el.remove()

      nextTick(() => {
        editor.registerPlugin(
          BubbleMenuPlugin({
            editor,
            element: el,
            options,
            pluginKey: resolvedPluginKey,
            resizeDelay,
            appendTo,
            shouldShow,
            getReferencedVirtualElement,
            updateDelay,
          }),
        )
      })
    })

    onBeforeUnmount(() => {
      const { editor } = props

      editor.unregisterPlugin(resolvedPluginKey)
    })

    // Vue owns this element; attrs are applied reactively by Vue
    // Plugin re-parents it when showing the menu
    return () => h('div', { ref: root, ...attrs }, slots.default?.())
  },
})
