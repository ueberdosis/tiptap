import { defineComponent, h } from 'vue'

export const NodeViewWrapper = defineComponent({
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
