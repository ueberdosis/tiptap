import Vue from 'vue'

export const NodeViewWrapper = Vue.extend({
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  inject: ['onDragStart', 'decorationClasses'],

  render(createElement) {
    return createElement(
      this.as, {
        // @ts-ignore
        class: this.decorationClasses.value,
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
