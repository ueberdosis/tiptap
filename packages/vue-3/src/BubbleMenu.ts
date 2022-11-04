import { BubbleMenuPlugin, BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'
import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
} from 'vue'

export const BubbleMenu = defineComponent({
  name: 'BubbleMenu',

  props: {
    pluginKey: {
      // TODO: TypeScript breaks :(
      // type: [String, Object as PropType<Exclude<BubbleMenuPluginProps['pluginKey'], string>>],
      type: null,
      default: 'bubbleMenu',
    },

    editor: {
      type: Object as PropType<BubbleMenuPluginProps['editor']>,
      required: true,
    },

    delay: {
      type: Number as PropType<BubbleMenuPluginProps['delay']>,
      default: undefined,
    },

    tippyOptions: {
      type: Object as PropType<BubbleMenuPluginProps['tippyOptions']>,
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
      const {
        delay,
        editor,
        pluginKey,
        shouldShow,
        tippyOptions,
      } = props

      editor.registerPlugin(BubbleMenuPlugin({
        delay,
        editor,
        element: root.value as HTMLElement,
        pluginKey,
        shouldShow,
        tippyOptions,
      }))
    })

    onBeforeUnmount(() => {
      const { pluginKey, editor } = props

      editor.unregisterPlugin(pluginKey)
    })

    return () => h('div', { ref: root }, slots.default?.())
  },
})
