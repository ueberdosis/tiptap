import Vue from 'vue'

export const NodeViewContent = Vue.extend({
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  render(createElement) {
    return createElement(
      this.as, {
        style: {
          whiteSpace: 'pre-wrap',
        },
        attrs: {
          'data-node-view-content': '',
        },
      },
    )
  },
})
