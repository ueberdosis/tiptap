import Vue from 'vue'

export const NodeViewContent = Vue.extend({
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  inject: ['isEditable'],

  render(createElement) {
    return createElement(
      this.as, {
        style: {
          whiteSpace: 'pre-wrap',
        },
        attrs: {
          'data-node-view-content': '',
          // @ts-ignore
          contenteditable: this.isEditable.value,
        },
      },
    )
  },
})
