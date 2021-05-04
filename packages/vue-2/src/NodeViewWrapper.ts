import Vue, { Component } from 'vue'

interface DecorationClass {
  value: string
}

interface NodeViewWrapperInterface extends Vue {
  as: string,
  decorationClasses: DecorationClass,
  onDragStart: Function
}

export const NodeViewWrapper: Component = {
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  inject: ['onDragStart', 'decorationClasses'],

  render(this: NodeViewWrapperInterface, createElement) {
    return createElement(
      this.as, {
        class: this.decorationClasses.value,
        style: {
          whiteSpace: 'normal',
        },
        attrs: {
          'data-node-view-wrapper': '',
        },
        on: {
          dragstart: this.onDragStart,
        },
      },
      this.$slots.default,
    )
  },
}
