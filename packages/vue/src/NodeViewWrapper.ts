import type { DefineComponent, NativeElements } from 'vue'
import { defineComponent, h } from 'vue'

type NativeTag = keyof NativeElements

export type NodeViewWrapperProps<T extends NativeTag = 'div'> = {
  /**
   * The element (or component) tag to render as the wrapper root.
   */
  as?: T
} & NativeElements[T]

const NodeViewWrapperComponent = defineComponent({
  name: 'NodeViewWrapper',

  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  inject: ['onDragStart', 'decorationClasses'],

  render() {
    return h(
      this.as,
      {
        // @ts-ignore
        class: this.decorationClasses,
        style: {
          whiteSpace: 'normal',
        },
        'data-node-view-wrapper': '',
        // @ts-ignore (https://github.com/vuejs/vue-next/issues/3031)
        onDragstart: this.onDragStart,
      },
      this.$slots.default?.(),
    )
  },
})

// Native attributes fall through to the root element at runtime. Infer them
// from `as` via Vue's NativeElements map so vue-tsc strictTemplates accepts
// tag-specific attrs (href, disabled, colspan, …) (#8658).
export const NodeViewWrapper = NodeViewWrapperComponent as unknown as {
  new <T extends NativeTag = 'div'>(
    props: NodeViewWrapperProps<T>,
  ): {
    $props: NodeViewWrapperProps<T>
  }
} & DefineComponent<NodeViewWrapperProps>
