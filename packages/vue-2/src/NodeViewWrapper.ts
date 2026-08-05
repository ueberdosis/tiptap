import type { Component, CreateElement } from 'vue'
import type Vue from 'vue'

/**
 * The instance type of `NodeViewWrapper`.
 */
export interface NodeViewWrapperInterface extends Vue {
  as: string
  decorationClasses: {
    value: string
  }
  onDragStart: () => void
}

/**
 * The outer element of a node view. Every Vue node view needs one.
 */
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
