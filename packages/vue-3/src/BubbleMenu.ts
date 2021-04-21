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
    editor: {
      type: Object as PropType<BubbleMenuPluginProps['editor']>,
      required: true,
    },

    tippyOptions: {
      type: Object as PropType<BubbleMenuPluginProps['tippyOptions']>,
      default: () => ({}),
    },
  },

  setup({ editor, tippyOptions }, { slots }) {
    const root = ref<HTMLElement | null>(null)

    onMounted(() => {
      editor.registerPlugin(BubbleMenuPlugin({
        editor,
        element: root.value as HTMLElement,
        tippyOptions,
      }))
    })

    onBeforeUnmount(() => {
      editor.unregisterPlugin(BubbleMenuPluginKey)
    })

    return () => h('div', { ref: root }, slots.default?.())
  },
})
