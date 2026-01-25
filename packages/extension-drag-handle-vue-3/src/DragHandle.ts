import type { DragHandlePluginProps, NestedOptions } from '@tiptap/extension-drag-handle'
import {
  defaultComputePositionConfig,
  DragHandlePlugin,
  dragHandlePluginDefaultKey,
  normalizeNestedOptions,
} from '@tiptap/extension-drag-handle'
import type { Node } from '@tiptap/pm/model'
import type { Plugin, PluginKey } from '@tiptap/pm/state'
import type { Editor } from '@tiptap/vue-3'
import type { PropType } from 'vue'
import { defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type DragHandleProps = Omit<Optional<DragHandlePluginProps, 'pluginKey' | 'nestedOptions'>, 'element'> & {
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

export const DragHandle = defineComponent({
  name: 'DragHandleVue',

  props: {
    pluginKey: {
      type: [String, Object] as PropType<PluginKey | string>,
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

  setup(props, { slots }) {
    const root = ref<HTMLElement | null>(null)
    const pluginHandle = shallowRef<{ plugin: Plugin; unbind: () => void } | null>(null)

    const initPlugin = () => {
      const { editor, pluginKey, onNodeChange, onElementDragEnd, onElementDragStart, computePositionConfig, nested } =
        props

      if (!root.value) {
        return
      }
      if (!props.editor || props.editor.isDestroyed) {
        return
      }

      const nestedOptions = normalizeNestedOptions(nested)

      const init = DragHandlePlugin({
        editor,
        element: root.value,
        pluginKey,
        computePositionConfig: { ...defaultComputePositionConfig, ...computePositionConfig },
        onNodeChange,
        onElementDragStart,
        onElementDragEnd,
        nestedOptions,
      })

      pluginHandle.value = init
      props.editor.registerPlugin(init.plugin)
    }

    const destroyPlugin = () => {
      if (!pluginHandle.value) {
        return
      }

      if (props.editor && !props.editor.isDestroyed) {
        props.editor.unregisterPlugin(props.pluginKey)
      }

      pluginHandle.value.unbind?.()
      pluginHandle.value = null
    }

    onMounted(async () => {
      await nextTick()
      initPlugin()
    })

    // Reinitialize plugin when nested option changes
    watch(
      () => props.nested,
      () => {
        destroyPlugin()
        initPlugin()
      },
      { deep: true },
    )

    onBeforeUnmount(() => {
      destroyPlugin()
    })

    return () =>
      h(
        'div',
        {
          ref: root,
          class: props.class,
          style: { visibility: 'hidden', position: 'absolute' },
          'data-dragging': 'false',
        },
        slots.default?.(),
      )
  },
})
