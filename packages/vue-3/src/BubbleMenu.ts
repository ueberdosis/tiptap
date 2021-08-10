import {
  h,
  ref,
  PropType,
  onMounted,
  onBeforeUnmount,
  defineComponent,
} from 'vue'
import {
  BubbleMenuPlugin,
  BubbleMenuPluginKey,
  BubbleMenuPluginProps,
} from '@tiptap/extension-bubble-menu'

export const BubbleMenu = defineComponent({
  name: 'BubbleMenu',

  props: {
    pluginKey: {
      // TODO: TypeScript breaks :(
      // type: [String, Object as PropType<Exclude<BubbleMenuPluginProps['key'], string>>],
      type: [String, Object],
      default: 'bubbleMenu',
    },

    editor: {
      type: Object as PropType<BubbleMenuPluginProps['editor']>,
      required: true,
    },

    tippyOptions: {
      type: Object as PropType<BubbleMenuPluginProps['tippyOptions']>,
      default: () => ({}),
    },

    shouldShow: {
      type: Function as PropType<Exclude<BubbleMenuPluginProps['shouldShow'], null>>,
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

      editor.registerPlugin(BubbleMenuPlugin({
        key: pluginKey,
        editor,
        element: root.value as HTMLElement,
        tippyOptions,
        shouldShow,
      }))
    })

    onBeforeUnmount(() => {
      const { editor } = props

      editor.unregisterPlugin(BubbleMenuPluginKey)
    })

    return () => h('div', { ref: root }, slots.default?.())
  },
})
