import Vue, { Component, CreateElement } from 'vue'

export interface NodeViewWrapperInterface extends Vue {
  as: string,
  decorationClasses: {
    value: string,
  },
  onDragStart: () => void,
}

export const NodeViewWrapper: Component = {
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  inject: ['onDragStart', 'decorationClasses'],

  render(this: NodeViewWrapperInterface, createElement: CreateElement) {
    return createElement(
      this.as,
      {
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
