import type { FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'
import { FloatingMenuPlugin } from '@tiptap/extension-floating-menu'
import type { PropType } from 'vue'
import { defineComponent, h, onBeforeUnmount, onMounted, ref, Teleport } from 'vue'

export const FloatingMenu = defineComponent({
  name: 'FloatingMenu',

  inheritAttrs: false,

  props: {
    pluginKey: {
      // TODO: TypeScript breaks :(
      // type: [String, Object as PropType<Exclude<FloatingMenuPluginProps['pluginKey'], string>>],
      type: null,
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
      type: Function as PropType<Exclude<Required<FloatingMenuPluginProps>['shouldShow'], null>>,
      default: null,
    },
  },

  setup(props, { slots, attrs }) {
    const root = ref<HTMLElement | null>(null)

    onMounted(() => {
      const { pluginKey, editor, options, appendTo, shouldShow } = props

      if (!root.value) {
        return
      }

      root.value.style.visibility = 'hidden'
      root.value.style.position = 'absolute'

      // Remove element from DOM; plugin will re-parent it when shown
      root.value.remove()

      editor.registerPlugin(
        FloatingMenuPlugin({
          pluginKey,
          editor,
          element: root.value as HTMLElement,
          options,
          appendTo,
          shouldShow,
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
