import type { FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'
import { FloatingMenuPlugin } from '@tiptap/extension-floating-menu'
import { PluginKey } from '@tiptap/pm/state'
import type { PropType } from 'vue'
import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'

export const FloatingMenu = defineComponent({
  name: 'FloatingMenu',

  inheritAttrs: false,

  props: {
    pluginKey: {
      // TODO: TypeScript breaks :(
      // type: [String, Object as PropType<Exclude<FloatingMenuPluginProps['pluginKey'], string>>],
      type: null,
      default: undefined,
    },

    editor: {
      type: Object as PropType<FloatingMenuPluginProps['editor']>,
      required: true,
    },

    updateDelay: {
      type: Number as PropType<FloatingMenuPluginProps['updateDelay']>,
      default: undefined,
    },

    resizeDelay: {
      type: Number as PropType<FloatingMenuPluginProps['resizeDelay']>,
      default: undefined,
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
      type: Function as PropType<Exclude<Required<FloatingMenuPluginProps>['shouldShow'], null>>,
      default: null,
    },
  },

  setup(props, { slots, attrs }) {
    const root = ref<HTMLElement | null>(null)
    const resolvedPluginKey = props.pluginKey ?? new PluginKey('floatingMenu')

    onMounted(() => {
      const { editor, updateDelay, resizeDelay, options, appendTo, shouldShow } = props

      const el = root.value

      if (!el) {
        return
      }

      el.style.visibility = 'hidden'
      el.style.position = 'absolute'

      // Remove element from DOM; plugin will re-parent it when shown
      el.remove()

      editor.registerPlugin(
        FloatingMenuPlugin({
          pluginKey: resolvedPluginKey,
          editor,
          element: el,
          updateDelay,
          resizeDelay,
          options,
          appendTo,
          shouldShow,
        }),
      )
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
