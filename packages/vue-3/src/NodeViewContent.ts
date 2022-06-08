import { defineComponent, h } from 'vue'

export const NodeViewContent = defineComponent({
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  render() {
    return h(this.as, {
      style: {
        whiteSpace: 'pre-wrap',
      },
      'data-node-view-content': '',
    })
  },
})
