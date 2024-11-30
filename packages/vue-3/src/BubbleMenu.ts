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
        updateDelay,
        editor,
        pluginKey,
        shouldShow,
        tippyOptions,
      } = props

      editor.registerPlugin(BubbleMenuPlugin({
        updateDelay,
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
