import type { DefineComponent, HTMLAttributes } from 'vue'
import { defineComponent, h } from 'vue'

export type NodeViewWrapperProps = {
  /**
   * The element (or component) tag to render as the wrapper root.
   */
  as?: string
} & HTMLAttributes

export const NodeViewWrapper = defineComponent({
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
  // Native attributes fall through to the root element at runtime; expose
  // them on the public props type so vue-tsc strictTemplates accepts them (#8658).
}) as DefineComponent<NodeViewWrapperProps>
