import type { Editor } from '@tiptap/core'
import {
  type DragHandlePluginProps,
  defaultComputePositionConfig,
  DragHandlePlugin,
  dragHandlePluginDefaultKey,
} from '@tiptap/extension-drag-handle'
import Vue, { type PropType } from 'vue'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type DragHandleProps = Omit<Optional<DragHandlePluginProps, 'pluginKey'>, 'element'> & {
  class?: string
  onNodeChange?: (data: { node: Node | null; editor: Editor; pos: number }) => void
}

export const DragHandle = Vue.extend({
  name: 'DragHandleVue',

  props: {
    pluginKey: {
      type: [String, Object] as PropType<DragHandleProps['pluginKey']>,
      default: () => dragHandlePluginDefaultKey,
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

    class: {
      type: String as PropType<DragHandleProps['class']>,
      default: 'drag-handle',
    },
  },

  mounted() {
    const { editor, pluginKey, onNodeChange } = this.$props

    editor.registerPlugin(
      DragHandlePlugin({
        editor,
        element: this.$el as HTMLElement,
        pluginKey,
        computePositionConfig: { ...defaultComputePositionConfig, ...this.computePositionConfig },
        onNodeChange,
      }).plugin,
    )
  },

  // eslint-disable-next-line vue/no-deprecated-destroyed-lifecycle
  beforeDestroy() {
    const { pluginKey, editor } = this.$props

    editor.unregisterPlugin(pluginKey as string)
  },

  render(h) {
    return h(
      'div',
      {
        class: this.class,
      },
      this.$slots.default,
    )
  },
})
