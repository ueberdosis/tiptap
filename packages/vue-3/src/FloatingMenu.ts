import {
  h,
  ref,
  PropType,
  onMounted,
  onBeforeUnmount,
  defineComponent,
} from 'vue'
import { FloatingMenuPlugin, FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'

export const FloatingMenu = defineComponent({
  name: 'FloatingMenu',

  props: {
    pluginKey: {
      // TODO: TypeScript breaks :(
      // type: [String, Object as PropType<Exclude<FloatingMenuPluginProps['pluginKey'], string>>],
      type: [String, Object],
      default: 'floatingMenu',
    },

    editor: {
      type: Object as PropType<FloatingMenuPluginProps['editor']>,
      required: true,
    },

    tippyOptions: {
      type: Object as PropType<FloatingMenuPluginProps['tippyOptions']>,
      default: () => ({}),
    },

    shouldShow: {
      type: Function as PropType<Exclude<Required<FloatingMenuPluginProps>['shouldShow'], null>>,
      default: null,
    },
  },

  setup(props, { slots }) {
    const root = ref<HTMLElement | null>(null)

    onMounted(() => {
      const {
        pluginKey,
        editor,
        tippyOptions,
        shouldShow,
      } = props

      editor.registerPlugin(FloatingMenuPlugin({
        pluginKey,
        editor,
        element: root.value as HTMLElement,
        tippyOptions,
        shouldShow,
      }))
    })

    onBeforeUnmount(() => {
      const { pluginKey, editor } = props

      editor.unregisterPlugin(pluginKey)
    })

    return () => h('div', { ref: root }, slots.default?.())
  },
})
