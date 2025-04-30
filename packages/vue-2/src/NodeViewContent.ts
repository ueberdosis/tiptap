import type { Component, CreateElement } from 'vue'
import type Vue from 'vue'

export interface NodeViewContentInterface extends Vue {
  as: string
}

export const NodeViewContent: Component = {
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  render(this: NodeViewContentInterface, createElement: CreateElement) {
    return createElement(this.as, {
      style: {
        whiteSpace: 'pre-wrap',
      },
      attrs: {
        'data-node-view-content': '',
      },
    })
  },
}
