import { h, defineComponent } from 'vue'

export const NodeViewWrapper = defineComponent({
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  inject: ['onDragStart'],

  render() {
    return h(
      this.as, {
        style: {
          whiteSpace: 'normal',
        },
        'data-node-view-wrapper': '',
        // @ts-ignore
        onDragStart: this.onDragStart,
      },
      this.$slots.default?.(),
    )
  },
})
