import type { DragHandlePluginProps } from '@tiptap/extension-drag-handle'
import {
  defaultComputePositionConfig,
  DragHandlePlugin,
  dragHandlePluginDefaultKey,
} from '@tiptap/extension-drag-handle'
import type { Editor } from '@tiptap/vue-3'
import type { PropType } from 'vue'
import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type DragHandleProps = Omit<Optional<DragHandlePluginProps, 'pluginKey'>, 'element'> & {
  class?: string
  onNodeChange?: (data: { node: Node | null; editor: Editor; pos: number }) => void
}

export const DragHandle = defineComponent({
  name: 'DragHandleVue',

  props: {
    pluginKey: {
      type: [String, Object] as PropType<DragHandleProps['pluginKey']>,
      default: dragHandlePluginDefaultKey,
    },

    editor: {
      type: Object as PropType<DragHandleProps['editor']>,
      required: true,
    },

    computePositionConfig: {
      type: Object as PropType<DragHandleProps['computePositionConfig']>,
      default: () => ({}),
    },

    onNodeChange: {
      type: Function as PropType<DragHandleProps['onNodeChange']>,
      default: null,
    },

    onElementDragStart: {
      type: Function as PropType<DragHandleProps['onElementDragStart']>,
      default: undefined,
    },

    onElementDragEnd: {
      type: Function as PropType<DragHandleProps['onElementDragEnd']>,
      default: undefined,
    },

    class: {
      type: String as PropType<DragHandleProps['class']>,
      default: 'drag-handle',
    },
  },

  setup(props, { slots }) {
    const root = ref<HTMLElement | null>(null)

    onMounted(() => {
      const { editor, pluginKey, onNodeChange, computePositionConfig, onElementDragStart, onElementDragEnd } = props

      editor.registerPlugin(
        DragHandlePlugin({
          editor,
          element: root.value as HTMLElement,
          pluginKey,
          computePositionConfig: { ...defaultComputePositionConfig, ...computePositionConfig },
          onNodeChange,
          onElementDragStart,
          onElementDragEnd,
        }).plugin,
      )
    })

    onBeforeUnmount(() => {
      const { pluginKey, editor } = props

      editor.unregisterPlugin(pluginKey as string)
    })

    return () =>
      h(
        'div',
        {
          ref: root,
          class: props.class,
          style: { visibility: 'hidden', position: 'absolute' },
        },
        slots.default?.(),
      )
  },
})
