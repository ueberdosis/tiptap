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
  },

  setup({ editor }, { slots }) {
    const root = ref<HTMLElement | null>(null)

    onMounted(() => {
      editor.registerPlugin(BubbleMenuPlugin({
        editor,
        element: root.value as HTMLElement,
      }))
    })

    onBeforeUnmount(() => {
      editor.unregisterPlugin(BubbleMenuPluginKey)
    })

    return () => h('div', { ref: root }, slots.default?.())
  },
})
