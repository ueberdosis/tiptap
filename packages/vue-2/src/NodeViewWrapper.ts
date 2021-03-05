import Vue from 'vue'

export const NodeViewWrapper = Vue.extend({
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  inject: ['onDragStart'],

  render(createElement) {
    return createElement(
      this.as, {
        style: {
          whiteSpace: 'normal',
        },
        attrs: {
          'data-node-view-wrapper': '',
        },
        on: {
          // @ts-ignore
          dragstart: this.onDragStart,
        },
      },
      this.$slots.default,
    )
  },
})
