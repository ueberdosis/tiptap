import type { Editor } from '@tiptap/core'
import {
  type DragHandlePluginProps,
  type NestedOptions,
  defaultComputePositionConfig,
  DragHandlePlugin,
  dragHandlePluginDefaultKey,
  normalizeNestedOptions,
} from '@tiptap/extension-drag-handle'
import { type PropType } from 'vue'

import { Vue } from './Vue.js'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type DragHandleProps = Omit<Optional<DragHandlePluginProps, 'pluginKey'>, 'element' | 'nestedOptions'> & {
  class?: string
  onNodeChange?: (data: { node: Node | null; editor: Editor; pos: number }) => void
  /**
   * Enable drag handles for nested content (list items, blockquotes, etc.).
   *
   * When enabled, the drag handle will appear for nested blocks, not just
   * top-level blocks. A rule-based scoring system determines which node
   * to target based on cursor position and configured rules.
   *
   * @default false
   */
  nested?: boolean | NestedOptions
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

    onElementDragStart: {
      type: Function as PropType<DragHandleProps['onElementDragStart']>,
      default: null,
    },

    onElementDragEnd: {
      type: Function as PropType<DragHandleProps['onElementDragEnd']>,
      default: null,
    },

    class: {
      type: String as PropType<DragHandleProps['class']>,
      default: 'drag-handle',
    },

    nested: {
      type: [Boolean, Object] as PropType<DragHandleProps['nested']>,
      default: false,
    },
  },

  mounted() {
    const { editor, pluginKey, onNodeChange, onElementDragStart, onElementDragEnd, nested } = this.$props

    const nestedOptions = normalizeNestedOptions(nested)

    editor.registerPlugin(
      DragHandlePlugin({
        editor,
        element: this.$el as HTMLElement,
        pluginKey,
        computePositionConfig: { ...defaultComputePositionConfig, ...this.computePositionConfig },
        onNodeChange,
        onElementDragStart,
        onElementDragEnd,
        nestedOptions,
      }).plugin,
    )
  },

  // eslint-disable-next-line vue/no-deprecated-destroyed-lifecycle
  beforeDestroy() {
    const { pluginKey, editor } = this.$props

    editor.unregisterPlugin(pluginKey as string)
  },

  render(h: Vue.CreateElement) {
    return h(
      'div',
      {
        class: this.class,
        attrs: {
          'data-dragging': 'false',
        },
      },
      this.$slots.default,
    )
  },
})
